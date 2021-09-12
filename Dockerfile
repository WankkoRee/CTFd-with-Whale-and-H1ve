FROM python:3.7-alpine
WORKDIR /opt/CTFd
RUN mkdir -p /opt/CTFd /var/log/CTFd /var/uploads

RUN echo http://mirrors.aliyun.com/alpine/v3.12/main/ > /etc/apk/repositories && \
    apk update

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN apk add \
        linux-headers \
        libffi-dev \
        gcc \
        make \
        g++ \
        musl-dev \
        mysql-client \
        git \
        openssl-dev

COPY . /opt/CTFd

RUN pip install -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com -r requirements.txt
RUN for d in CTFd/plugins/*; do \
        if [ -f "$d/requirements.txt" ]; then \
            pip install -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com -r $d/requirements.txt; \
        fi; \
    done;

RUN chmod +x /opt/CTFd/docker-entrypoint.sh
RUN adduser -D -u 1001 -s /bin/sh ctfd
RUN chown -R 1001:1001 /opt/CTFd /var/log/CTFd /var/uploads

USER 1001
EXPOSE 8000
ENTRYPOINT ["/opt/CTFd/docker-entrypoint.sh"]
