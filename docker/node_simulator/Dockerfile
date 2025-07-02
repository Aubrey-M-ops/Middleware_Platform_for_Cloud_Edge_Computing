FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y nodejs npm curl
CMD ["tail", "-f", "/dev/null"] # keep container running