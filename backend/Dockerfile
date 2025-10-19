# Use an official OpenJDK 21 runtime as a parent image.
# 'eclipse-temurin:21-jre-focal' provides Java 21 JRE on an Ubuntu Focal base.
# This aligns with your installed JDK 21 and is a good choice for newer applications.
FROM eclipse-temurin:21-jre

# Set the working directory inside the container.
WORKDIR /app

# Copy the built JAR file from your host machine (from the 'target' directory)
# into the container's '/app' directory and rename it to 'app.jar'.
# IMPORTANT: Ensure 'assignment-0.0.1-SNAPSHOT.jar' matches the actual name
# of the JAR file created by 'mvnw.cmd clean package' in your 'target' folder.
# If your version is different, update the path accordingly.
COPY target/assignment-0.0.1-SNAPSHOT.jar app.jar

# Expose the port on which the Spring Boot application will run (default is 8080).
EXPOSE 8080

# Define the command to run the application when the container starts.
ENTRYPOINT ["java", "-jar", "app.jar"]