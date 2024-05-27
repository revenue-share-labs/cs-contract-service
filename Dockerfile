FROM node:18-alpine
WORKDIR /app
# Bundle app source
COPY . .

#temporary solution, delete following lines for CI
RUN npm install && \
    npm run prisma -- generate && \
    npm run build

# Expose port and start application
#EXPOSE 3020
#CMD ["/bin/bash", "-c", "./run.sh"]
