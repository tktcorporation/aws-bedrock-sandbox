# Project Overview

## Project Name

Generative AI Use Cases (GenU) - AWS Bedrock Sandbox

## Purpose

GenU is a comprehensive AWS-based platform for implementing generative AI in business operations, built on Amazon Bedrock. It provides well-architected application implementations with multiple business use cases.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand (state management)
- **Backend**: AWS Lambda (TypeScript), API Gateway with WebSocket support
- **Infrastructure**: AWS CDK for IaC
- **AI Services**: Amazon Bedrock (core LLM service), Amazon Transcribe, Amazon Polly
- **Storage & CDN**: S3 + CloudFront
- **Authentication**: AWS Cognito (SAML, self-signup support)
- **RAG**: Amazon Kendra/Knowledge Base
- **Node Version**: 24

## Multi-language Support

Supports 6 languages: EN, JA, KO, TH, VI, ZH using i18next

## Key Features

- 15+ built-in use cases (chat, text generation, summarization, translation, image/video generation, etc.)
- Multimodal support (text, image, video, audio)
- Real-time streaming via WebSocket
- RAG Chat capabilities
- Voice Chat with bidirectional communication
- Web content extraction
- MCP (Model Context Protocol) for agent extensions

## Repository Type

This is a forked repository with upstream tracking from aws-samples/generative-ai-use-cases
