FROM maven:3.8.3-openjdk-17 AS build
RUN mkdir /project
COPY . /project
WORKDIR /project
RUN mvn clean package -DskipTests

FROM openjdk:17-alpine
RUN mkdir /app
RUN addgroup --system javauser && adduser -S -s /bin/false -G javauser javauser
COPY --from=build /project/target/effort-tracker-0.0.1-SNAPSHOT.jar /app/effort-tracker-0.0.1-SNAPSHOT.jar
WORKDIR /app
RUN chown -R javauser:javauser /app
USER javauser
CMD "java" "-jar" "effort-tracker-0.0.1-SNAPSHOT.jar"