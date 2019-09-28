FROM node:carbon

# ARG declares a build-time variable
#ARG NODE_ENV=production
ARG NODE_ENV=development

# ENV persists for the duration of the app`s lifespan
ENV NODE_ENV=$NODE_ENV

# ARG RELEASE_NAME=default
# ENV RELEASE_NAME=$RELEASE_NAME

# ARG COMMIT=default
# ENV COMMIT=$COMMIT

# Install operating system updates.
RUN apt-get update -y

# Create "gesso" group, create "gesso" user in the "gesso" group.
RUN groupadd -r gesso
RUN useradd -m -r -g gesso gesso

# Set working directory for subsequent commands (i.e., RUN, CMD, ENTRYPOINT,
# COPY, ADD, etc.).
WORKDIR /home/gesso/

# Copy files from current working directory (i.e., `.`) on the local filesystem
# to the configured WORKDIR (i.e., `.`) in the Docker container.
COPY . .
# TODO: Checkout from repository.

# Set owner of "/home/gesso/" home directory to user "gesso" and set the user
# to "gesso".
RUN chown -R gesso /home/gesso/
USER gesso

# Clone repository.
# TODO: Checkout activity-version.
# RUN git clone git@github.com:gesso/gesso-host gesso-host
# RUN cd gesso-host

# Install Node module dependencies.
# <REMOVE>
# RUN mkdir /home/gesso/.gesso
# RUN mkdir /home/gesso/.gesso/logs
# </REMOVE>
RUN npm install --ignore-optional
RUN npm run build
RUN node dist/index.js initialize

# Expose ports to host.
# EXPOSE 8080
EXPOSE 5672

# RUN node dist/index.js start
CMD [ "node", "dist/index.js", "start" ]
