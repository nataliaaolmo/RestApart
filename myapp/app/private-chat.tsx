import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useRoute } from "@react-navigation/native";
import {View, Text, TextInput, ScrollView, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager, Dimensions} from "react-native";
import api from "../app/api";
import EmojiSelector from "react-native-emoji-selector";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PrivateChat() {
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const jwt = localStorage.getItem("jwt");
  const route = useRoute();
  const { id } = route.params as { id: string };

  const [messages, setMessages] = useState<{ sender: { username: string }; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<{ username: string; photo: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadMessages();
    loadReceiver();
    setupWebSocket();
    fetchCurrentUser();

    return () => {
      if (stompClient.current?.active) {
        stompClient.current.deactivate();
      }
    };
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error obteniendo mensajes:", err);
    }
  };

  const loadReceiver = async () => {
    try {
      const res = await api.get(`/users/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setOtherUser(res.data);
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
    }
  };

  const setupWebSocket = () => {
    const socket = () => new SockJS("http://localhost:8080/ws");
    stompClient.current = new Client({
      webSocketFactory: socket,
      connectHeaders: { Authorization: `Bearer ${jwt}` },
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
  

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('jwt');
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
        <Image
          source={{ uri: `http://localhost:8080/images/${otherUser.photo}` }}
          style={styles.avatar}
        />
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
  container: { flex: 1, backgroundColor: "#0D1B2A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#E0E1DD",
    backgroundColor: "#102437",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  headerText: { fontSize: 18, color: "#E0E1DD", fontWeight: "bold" },
  chatBox: { flex: 1, paddingHorizontal: 15, paddingVertical: 10 },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 10,
    maxWidth: "80%",
  },
  messageLeft: { justifyContent: "flex-start", alignSelf: "flex-start" },
  messageRight: { justifyContent: "flex-end", alignSelf: "flex-end" },
  bubble: {
    padding: 10,
    borderRadius: 15,
  },
  bubbleLeft: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
  },
  bubbleRight: {
    backgroundColor: "#A8DADC",
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: "#1D3557",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#102437",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#A8DADC",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    color: "#1D3557",
    fontWeight: "bold",
  },
  typingIndicator: {
    fontSize: 12,
    color: "#AFC1D6",
    marginTop: 2,
  },
  sentTick: {
    fontSize: 12,
    color: "#1D3557",
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  emojiToggle: {
    fontSize: 22,
    marginRight: 10,
  },
  backButton: {
    marginRight: 10,
  },  
});
