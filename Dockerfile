FROM arm64v8/node:18.12.1

WORKDIR /app

COPY package*.json ./
RUN npm install


RUN apt-get update && \
	apt-get install -y --no-install-recommends \
	wget \
	ffmpeg \
	&& rm -rf /var/lib/apt/lists/*

# Install pm2 
RUN npm install -g pm2


RUN mkdir /app/uploads /app/uploads/audio

COPY . .
EXPOSE 3444
CMD ["pm2-runtime", "start", "app.js"]