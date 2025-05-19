import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useRoute } from "@react-navigation/native";
import {View, Text, TextInput, ScrollView, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager, Dimensions} from "react-native";
import api from "../app/api";
import EmojiSelector from "react-native-emoji-selector";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import storage from '../utils/storage';


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PrivateChat() {
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const route = useRoute();
  const { id } = route.params as { id: string };

  const [messages, setMessages] = useState<{ sender: { username: string }; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<{ username: string; profilePicture: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadToken = async () => {
      const token = await storage.getItem("jwt");
      setJwt(token);
      if (token) {
        loadMessages(token);
        loadReceiver(token);
        setupWebSocket(token);
        fetchCurrentUser(token);
      }
    };

    loadToken();

    return () => {
      if (stompClient.current?.active) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  const loadMessages = async (token: string) => {
    try {
      const res = await api.get(`/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error obteniendo mensajes:", err);
    }
  };

  const loadReceiver = async (token: string) => {
    try {
      const res = await api.get(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOtherUser(res.data);
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
    }
  };

  const setupWebSocket = (token: string) => {
    const socket = () => new SockJS("https://restapart.onrender.com/ws");
    stompClient.current = new Client({
      webSocketFactory: socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: console.log,
      onConnect: () => {
        setConnected(true);
        stompClient.current?.subscribe("/user/queue/messages", (message) => {
          const body = JSON.parse(message.body);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setMessages((prev) => [...prev, body]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });
    stompClient.current.activate();
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!connected || !stompClient.current?.connected || !otherUser) {
      console.error("STOMP client not ready or otherUser is null");
      return;
    }
  
    const message = {
      sender: currentUser?.username || "Unknown",
      receiver: otherUser.username,
      content: input,
    };
  
    stompClient.current.publish({
      destination: "/app/chat.private",
      body: JSON.stringify(message),
    });
  
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [
      ...prev,
      { sender: { username: currentUser?.username || "Unknown" }, content: input },
    ]);
    setInput("");
    setIsTyping(false);
    setShowEmojis(false);
  };
  

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await api.get('/users/auth/current-user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      {otherUser && (
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/inbox-screen" })} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E0E1DD" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/profile', params: { id } })}>
          <Image
            source={{ uri: `https://restapart.onrender.com/images/${otherUser.profilePicture}` }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>{otherUser.username}</Text>
      </View>
      )}
      <ScrollView
        style={styles.chatBox}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
      {messages.map((msg, index) => {
        const isCurrentUser = msg.sender.username === currentUser?.username;
        return (
          <View
            key={index}
            style={[
              styles.messageContainer,
              isCurrentUser ? styles.messageRight : styles.messageLeft,
            ]}
          >
            <View style={[styles.bubble, isCurrentUser ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={styles.messageText}>{msg.content}</Text>
              {isCurrentUser && (
                <Text style={styles.sentTick}>✓</Text>
              )}
            </View>
          </View>
        );
      })}
      </ScrollView>
        <View style={styles.inputRow}>
        <TouchableOpacity onPress={() => setShowEmojis(!showEmojis)}>
          <Text style={styles.emojiToggle}>😊</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(text) => {
            setInput(text);
            setIsTyping(text.length > 0);
          }}
          placeholder="Escribe un mensaje"
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity onPress={sendMessage} disabled={!connected}>
          <Text style={styles.sendButton}>ENVIAR</Text>
        </TouchableOpacity>
      </View>
      {showEmojis && (
        <EmojiSelector
          onEmojiSelected={emoji => {
            setInput(prev => prev + emoji);
            setIsTyping(true);
          }}
          showSearchBar={false}
          showSectionTitles={false}
          columns={8}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B263B",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  backButton: {
    marginRight: 15,
  },
  chatBox: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#0D1B2A",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B263B",
    padding: 10,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    backgroundColor: "#2C394B",
    padding: 10,
    borderRadius: 20,
    color: "#E0E1DD",
    marginHorizontal: 10,
  },
  sendButton: {
    color: "#E0E1DD",
    fontWeight: "bold",
  },
  messageContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: "80%",
  },
  messageLeft: {
    alignSelf: "flex-start",
  },
  messageRight: {
    alignSelf: "flex-end",
  },
  bubble: {
    padding: 10,
    borderRadius: 18,
    position: "relative",
  },
  bubbleLeft: {
    backgroundColor: "#1B263B",
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: "#415A77",
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: "#E0E1DD",
  },
  sentTick: {
    color: "#E0E1DD",
    fontSize: 10,
    alignSelf: "flex-end",
    marginLeft: 5,
  },
  emojiToggle: {
    fontSize: 20,
  },
});
