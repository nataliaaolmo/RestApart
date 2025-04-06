package com.eventbride.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventbride.dto.UserDTO;
import com.eventbride.owner.Owner;
import com.eventbride.student.Student;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public List<User> getAllUsers() {
        return (List<User>) userRepository.findAll();
    }

    @Transactional
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    @Transactional
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }

    @Transactional
    public User registerUser(User user) {
        if (user.getId() != null) {
            throw new RuntimeException("No se puede registrar un usuario con ID preexistente");
        }
    
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("El username ya está en uso");
        }
        
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

	@Transactional(readOnly = true)
	public User findUser(Integer id) {
		return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
	}

    @Transactional
    public User updateUser(Integer id, UserDTO userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setUsername(userDetails.getUsername());
        user.setPassword(userDetails.getPassword());
        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setTelephone(userDetails.getTelephone());
        user.setDateOfBirth(userDetails.getDateOfBirth());
        user.setGender(userDetails.getGender());
        user.setDescription(userDetails.getDescription());
        user.setPhoto(userDetails.getProfilePicture());

        if ("OWNER".equals(user.getRole())) {
            if (user.getStudent() != null) {
                user.setStudent(null);
            }
            if (user.getOwner() == null) {
                Owner owner = new Owner();
                owner.setUser(user);
                user.setOwner(owner);
            }
            if (userDetails.getExperienceYears() != null) {
                user.getOwner().setExperienceYears(userDetails.getExperienceYears());
            }
        
        } else if ("STUDENT".equals(user.getRole())) {
            if (user.getOwner() != null) {
                user.setOwner(null);
            }
            if (user.getStudent() == null) {
                Student student = new Student();
                student.setUser(user);
                user.setStudent(student);
            }
            user.getStudent().setAcademicCareer(userDetails.getAcademicCareer());
            user.getStudent().setHobbies(userDetails.getHobbies());
            user.getStudent().setIsSmoker(userDetails.getIsSmoker());
        }        

        return userRepository.save(user);
    }
    

    @Transactional
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }
    
    
}
