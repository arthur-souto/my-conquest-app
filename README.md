# Conquest

> Registre e compartilhe conquistas com seu grupo.

Conquest é um aplicativo mobile que permite criar grupos, registrar conquistas com evidências e organizá-las por tags.

## Screenshots

| Login | Home | Grupos | Conquistas | Criar Conquista | Tags |
|-------|------|--------|------------|-----------------|------|
| <img src="docs/login.jpg" width="200"/> | <img src="docs/home.jpg" width="200"/> | <img src="docs/grupos.jpg" width="200"/> | <img src="docs/conquistas.jpg" width="200"/> | <img src="docs/criar-conquista.jpg" width="200"/> | <img src="docs/tags.jpg" width="200"/> |

## Funcionalidades

- **Autenticação** — Login seguro via JWT
- **Grupos** — Crie e gerencie grupos de conquistas
- **Conquistas** — Registre conquistas dentro de um grupo
- **Tags** — Organize conquistas com tags personalizadas
- **Evidências** — Anexe fotos ou documentos como prova das conquistas

## Stack

### Mobile (`conquest-app`)

| Tecnologia | Descrição |
|-----------|-----------|
| Expo 54 | Plataforma React Native |
| Expo Router v4 | Roteamento baseado em arquivos |
| GlueStack UI v3 | Biblioteca de componentes |
| NativeWind v4 | Utilitários Tailwind para RN |
| Supabase JS | Storage de arquivos |
| Axios | Cliente HTTP |

### Backend (`conquest-backend`)

| Tecnologia | Descrição |
|-----------|-----------|
| Spring Boot | Framework principal |
| Java | Linguagem |
| JPA / Hibernate | ORM |
| JWT | Autenticação |

## Estrutura do Projeto

```
project-1/
├── conquest-app/          # Aplicativo React Native (Expo)
│   ├── app/
│   │   ├── (auth)/        # Tela de login
│   │   ├── (tabs)/        # Tabs principais (grupos, tags)
│   │   └── group/         # Detalhes do grupo e conquistas
│   ├── services/          # Camada de serviços HTTP
│   └── lib/               # Utilitários
└── conquest-backend/      # API REST (Spring Boot)
    └── src/main/java/
        ├── controller/
        ├── service/
        ├── entity/
        ├── dto/
        └── repository/
```

## API Endpoints

### Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/v1/auth/sign-in` | Login |

### Grupos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/v1/groups` | Criar grupo |
| GET | `/v1/groups` | Listar grupos |
| DELETE | `/v1/groups/{id}` | Deletar grupo |

### Tags

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/v1/tags` | Criar tag |
| GET | `/v1/tags` | Listar tags |
| DELETE | `/v1/tags/{id}` | Deletar tag |

### Conquistas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/v1/achievements/{groupId}` | Criar conquista |
| GET | `/v1/achievements/{groupId}` | Listar conquistas do grupo |
| DELETE | `/v1/achievements/{groupId}/{achievementId}` | Deletar conquista |
| POST | `/v1/achievements/{groupId}/{achievementId}/tags/{tagId}` | Adicionar tag à conquista |
| DELETE | `/v1/achievements/{groupId}/{achievementId}/tags/{tagId}` | Remover tag da conquista |
| POST | `/v1/achievements/{groupId}/{achievementId}/evidences` | Adicionar evidência |
| DELETE | `/v1/achievements/{groupId}/{achievementId}/evidences/{evidenceId}` | Remover evidência |

## Como Rodar

### Backend

```bash
cd conquest-backend
./mvnw spring-boot:run
```

### Mobile

```bash
cd conquest-app
npm install
npx expo start
```
