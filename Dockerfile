FROM python:3.7.17-alpine3.18

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories && \
    apk update

RUN apk add --no-cache linux-headers \
                       libffi-dev \
                       gcc \
                       make \
                       g++ \
                       musl-dev \
                       mysql-client \
                       git \
                       openssl-dev

RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

WORKDIR /opt/CTFd
COPY ./CTFd/ /opt/CTFd/

RUN pip install --no-cache-dir -r requirements.txt
RUN for d in CTFd/plugins/*; do \
        if [ -f "$d/requirements.txt" ]; then \
            pip install --no-cache-dir -r $d/requirements.txt; \
        fi; \
    done;

RUN chmod +x /opt/CTFd/docker-entrypoint.sh
RUN mkdir -p /var/log/CTFd /var/uploads
RUN adduser -D -u 1001 -s /bin/sh ctfd
RUN chown -R 1001:1001 /opt/CTFd /var/log/CTFd /var/uploads

USER 1001
EXPOSE 8000
ENTRYPOINT ["/opt/CTFd/docker-entrypoint.sh"]
