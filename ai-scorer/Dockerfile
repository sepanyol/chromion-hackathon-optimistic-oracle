FROM node:22

# System tools für cron
RUN apt-get update && apt-get install -y cron

# Set Arbeitsverzeichnis
WORKDIR /app

# Copy project files

# almost never touched files
COPY ./tsconfig.json ./tsconfig.json 
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

# tsup installieren global oder lokal
RUN npm install
RUN npm install -g tsup

# most uncached
COPY ./run.sh ./run.sh
COPY ./src ./src

RUN chmod +x /app/run.sh

# Startpunkt: npm install, build und dann cron starten
CMD ["sh", "-c", "./run.sh"]
