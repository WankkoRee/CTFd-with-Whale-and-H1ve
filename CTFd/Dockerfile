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

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY ./CTFd/plugins/ctfd-whale/requirements.txt ./CTFd/plugins/ctfd-whale/
RUN for d in CTFd/plugins/*; do \
        if [ -f "$d/requirements.txt" ]; then \
            pip install --no-cache-dir -r $d/requirements.txt; \
        fi; \
    done;

RUN mkdir -p /var/log/CTFd /var/uploads
RUN adduser -D -u 1001 -s /bin/sh ctfd
RUN chown -R 1001:1001 /var/log/CTFd /var/uploads

COPY ./ ./
RUN chmod +x ./docker-entrypoint.sh
RUN chown -R 1001:1001 .

USER 1001
EXPOSE 8000
ENTRYPOINT ["/opt/CTFd/docker-entrypoint.sh"]
