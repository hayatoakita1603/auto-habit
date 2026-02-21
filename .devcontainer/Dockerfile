FROM node:24-bullseye-slim

ARG TERRAFORM_VERSION=1.14.5


RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Apple Silicon / Intel 両対応のためアーキテクチャを実行時に判定する
RUN ARCH=$(dpkg --print-architecture) \
    && curl -fsSL "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${ARCH}.zip" \
         -o /tmp/terraform.zip \
    && unzip /tmp/terraform.zip -d /usr/local/bin/ \
    && rm /tmp/terraform.zip

# gcloud CLI（プロンプトを無効化して非対話実行）
RUN curl -sSL https://sdk.cloud.google.com | CLOUDSDK_CORE_DISABLE_PROMPTS=1 bash
ENV PATH="/root/google-cloud-sdk/bin:$PATH"

# yarn を有効化（corepack は Node 24 に内蔵済みのため追加インストール不要）
RUN corepack enable

WORKDIR /workspace
