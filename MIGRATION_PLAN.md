# CreateContent Endpoint Migration Plan
## Azure Functions → Node.js/Express

**Migration Date Started:** December 22, 2025  
**Strategy:** Incremental migration with parallel testing  
**Approach:** Implement and test one flow at a time

---

## 📋 Project Overview

### Current State
- **Location:** `CreateContent/` folder (27 files)
- **Framework:** Azure Functions v2
- **Auth:** Admin level (`authLevel: "admin"`)
- **Route:** `POST /Courses/{courseCode}/CreateContent`
- **Pattern:** Async operations triggered, immediate response returned

### Target State
- **Framework:** Node.js + Express + TypeScript
- **Auth:** Custom JWT/Admin middleware
- **Pattern:** Same - trigger async operations, return immediate response
- **Deployment:** Standalone Node.js application

---

## 🔍 Dependency Analysis

### External Services Required
- **OpenAI API** (`OPENAI_API_KEY`)
  - GPT-4 for content generation
  - DALL-E for image generation
  - Text-to-speech
- **Azure Storage** (`AZURE_STORAGE_CONNECTION_STRING`)
  - Blob storage for images/audios
- **Azure TTS** (`TTS_SUBSCRIPTION_KEY`)
  - Text-to-speech service
- **MongoDB** (`MONGODB_ATLAS_URI`, `MONGODB_ATLAS_DATABASE`)
  - Primary database
- **Pexels API** (for stock photos)
- **Vecteezy API** (for vector graphics)
- **Azure Cognitive Services** (`OCP_APIM_SUBSCRIPTION_KEY`)

### Shared Dependencies (Need to Copy/Adapt)
```
shared/
├── mongo.ts                    ✓ Database connection
├── saveLog.ts                  ✓ Logging utility
├── types.ts                    ✓ Type definitions
├── creditConsumption.ts        ✓ Credit tracking
├── translator.ts               ✓ Translation utilities
├── languages.ts                ✓ Language configurations
├── updateCourseDuration.ts     ✓ Duration calculator
├── compareParagraphs.ts        ✓ Content comparison
└── SaveAssetsHD.ts             ✓ Asset storage
```

### CreateContent Internal Files (27 files)
```
CreateContent/
├── index.ts                           [MAIN ENTRY] Router logic
├── asyncCycle.ts                      [ORCHESTRATOR] Main workflow
├── addSections.ts                     [CORE] Section builder
├── createContentTable.ts              [CORE] Syllabus generator (GPT-4)
│
├── asyncCreateParagraphsWithAgent.ts  [AI] Content generation with AI agents
├── asyncCreateParagrahs.ts            [AI] Content generation
├── asyncCreateSlides.ts               [AI] Slide creation orchestrator
├── asyncCreateSlide.ts                [AI] Single slide creation
├── asyncCreateTitles.ts               [AI] Title generation
├── asyncCreateAudios.ts               [AI] Audio generation (TTS)
├── asyncCreateDallePrompt.ts          [AI] DALL-E prompt generation
├── asyncCreateDalleImage.ts           [AI] DALL-E image creation
│
├── asyncPexels.ts                     [MEDIA] Pexels integration
├── asyncVecteezy.ts                   [MEDIA] Vecteezy integration
├── pexels.ts                          [MEDIA] Pexels service
├── vecteezy.ts                        [MEDIA] Vecteezy service
├── findImages.ts                      [MEDIA] Image search
│
├── fillTemplate.ts                    [TEMPLATE] Template filling
├── findBestTemplateMatch.ts           [TEMPLATE] Template matcher
│
├── createAudios.ts                    [UTIL] Audio creation utility
├── createKeyphrases.ts                [UTIL] Keyphrase extraction
├── createSrt.ts                       [UTIL] Subtitle generation
├── titleExtraction.ts                 [UTIL] Title extraction
├── migrateCourse.ts                   [UTIL] Course migration
│
├── prompts.ts                         [CONFIG] AI prompts
├── gpt3.prompt.ts                     [CONFIG] GPT-3 prompts
├── interfaces.ts                      [CONFIG] TypeScript interfaces
└── function.json                      [CONFIG] Azure Functions config
```

---

## 🎯 Generation Types & Workflows

### 1. `generateByTitle` ⭐ [START HERE]
**Flow:**
```
1. Receive: courseTitle, maxSections, courseDescription
2. Call: createContentTable() → GPT-4 generates syllabus
3. Call: addSections() → Creates empty section structure
4. Update DB: Save course with sections
5. Trigger: asyncCreateContent() → Background processing
6. Return: { syllabus: string[], currentCourse: Course }
```

**Dependencies:**
- ✓ createContentTable.ts (GPT-4)
- ✓ addSections.ts
- ✓ asyncCycle.ts
- ✓ asyncCreateSlides.ts
- ✓ prompts.ts

**Testing Priority:** HIGH (most common use case)

---

### 2. `generateByStructure`
**Flow:**
```
1. Receive: contentTable (predefined sections)
2. Call: addSections() → Creates structure from provided table
3. Update DB: Save course with sections
4. Trigger: asyncCreateContent() → Background processing
5. Return: currentCourse
```

**Dependencies:**
- ✓ addSections.ts
- ✓ asyncCycle.ts

**Testing Priority:** MEDIUM

---

### 3. `generatedByDocuments`
**Flow:**
```
1. Receive: parsed (document structure), vectorStoreId
2. Call: addDocumentsSections() → Creates structure from documents
3. Update DB: Save course with vectorStoreId
4. Trigger: asyncCreateContent() → Background processing with RAG
5. Return: currentCourse
```

**Dependencies:**
- ✓ addSections.ts (addDocumentsSections)
- ✓ asyncCycle.ts
- ✓ asyncCreateParagraphsWithAgent.ts (uses vectorStoreId)

**Testing Priority:** MEDIUM (RAG-based generation)

---

### 4. `resume`
**Flow:**
```
1. Find incomplete lesson (empty paragraphs or string paragraphs)
2. Resume async processing from that point
3. Return: status message
```

**Dependencies:**
- ✓ asyncCycle.ts (resume logic)

**Testing Priority:** LOW (recovery mechanism)

---

## 🔄 Async Processing Flow (Critical!)

**asyncCycle.ts workflow:**
```
1. Save course structure to DB
2. For each section:
   3. For each lesson:
      4. asyncCreateSlides()
         → asyncCreateParagraphsWithAgent() OR asyncCreateParagrahs()
         → asyncCreateSlide()
            → asyncCreateTitles()
            → asyncCreateDallePrompt()
            → asyncCreateDalleImage() OR asyncPexels() OR asyncVecteezy()
            → asyncCreateAudios()
            → createSrt() (subtitles)
            → fillTemplate()
         → Save to DB
```

**Key Points:**
- Operations happen AFTER response is sent to client
- Each step updates the DB incrementally
- Errors are logged but don't fail the entire process
- Client polls or uses webhooks to check progress

---

## 📦 Migration Checklist

### Phase 1: Foundation Setup
- [ ] **1.1** Create new Node.js project structure
  - [ ] Initialize package.json
  - [ ] Set up TypeScript
  - [ ] Configure tsconfig.json
  - [ ] Install dependencies
- [ ] **1.2** Set up Express server
  - [ ] Basic server setup
  - [ ] Error handling middleware
  - [ ] Request logging
  - [ ] CORS configuration
- [ ] **1.3** Migrate shared utilities
  - [ ] mongo.ts → database connection
  - [ ] saveLog.ts → logging service
  - [ ] types.ts → type definitions
  - [ ] Environment configuration

### Phase 2: Core Services
- [ ] **2.1** Database layer
  - [ ] MongoDB connection pooling
  - [ ] Course repository/service
  - [ ] Error handling
- [ ] **2.2** Authentication middleware
  - [ ] Admin auth equivalent
  - [ ] JWT validation (if needed)
- [ ] **2.3** Logging service
  - [ ] Replace saveLog with structured logging
  - [ ] Error tracking

### Phase 3: Content Generation Services
- [ ] **3.1** OpenAI services
  - [ ] GPT-4 wrapper
  - [ ] DALL-E wrapper
  - [ ] Token counting
  - [ ] Rate limiting
- [ ] **3.2** Media services
  - [ ] Pexels integration
  - [ ] Vecteezy integration
  - [ ] Azure Blob Storage
- [ ] **3.3** Audio services
  - [ ] Azure TTS integration
  - [ ] Audio file management
  - [ ] SRT generation

### Phase 4: Flow 1 - generateByTitle ⭐
- [ ] **4.1** Migrate core functions
  - [ ] createContentTable.ts
  - [ ] addSections.ts
  - [ ] prompts.ts
- [ ] **4.2** Create controller
  - [ ] Route handler
  - [ ] Input validation
  - [ ] Error handling
- [ ] **4.3** Create async orchestrator
  - [ ] asyncCycle.ts (partial - for this flow)
  - [ ] asyncCreateSlides.ts
  - [ ] Background job queue
- [ ] **4.4** Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Load testing
  - [ ] Compare outputs with Azure Function

### Phase 5: Flow 2 - generateByStructure
- [ ] **5.1** Extend controller
- [ ] **5.2** Test with predefined structures
- [ ] **5.3** Validate against Azure Function

### Phase 6: Flow 3 - generatedByDocuments
- [ ] **6.1** RAG integration
  - [ ] asyncCreateParagraphsWithAgent.ts
  - [ ] Vector store integration
- [ ] **6.2** Controller extension
- [ ] **6.3** Testing with document uploads

### Phase 7: Flow 4 - resume
- [ ] **7.1** Resume logic
- [ ] **7.2** State recovery
- [ ] **7.3** Testing edge cases

### Phase 8: Complete Migration
- [ ] **8.1** Migrate remaining utilities
  - [ ] fillTemplate.ts
  - [ ] findBestTemplateMatch.ts
  - [ ] createKeyphrases.ts
  - [ ] titleExtraction.ts
  - [ ] migrateCourse.ts
- [ ] **8.2** Complete asyncCycle.ts
  - [ ] All async operations
  - [ ] Error recovery
  - [ ] Progress tracking
- [ ] **8.3** Performance optimization
  - [ ] Caching
  - [ ] Connection pooling
  - [ ] Rate limiting
- [ ] **8.4** Monitoring & observability
  - [ ] Health checks
  - [ ] Metrics
  - [ ] Alerts

### Phase 9: Deployment & Cutover
- [ ] **9.1** Deployment setup
  - [ ] Docker containerization
  - [ ] Environment configuration
  - [ ] CI/CD pipeline
- [ ] **9.2** Testing in staging
  - [ ] End-to-end tests
  - [ ] Performance tests
  - [ ] Load tests
- [ ] **9.3** Gradual rollout
  - [ ] Canary deployment (10% traffic)
  - [ ] Monitor errors/performance
  - [ ] Full cutover
- [ ] **9.4** Cleanup
  - [ ] Archive Azure Function
  - [ ] Update documentation
  - [ ] Update frontend endpoints

---

## 🚨 Critical Considerations

### 1. Background Processing
**Azure Functions:** Uses durable functions/queues for background work  
**Node.js Solution Options:**
- **Option A:** Bull/BullMQ with Redis (recommended)
- **Option B:** Node.js worker threads
- **Option C:** Separate microservice for processing

**Recommendation:** Use BullMQ for robust job queue with retry logic

### 2. Authentication
**Current:** Azure Functions admin key  
**Target:** Need equivalent protection
- JWT middleware
- API key validation
- Same security level

### 3. Error Handling
**Current:** Logs to MongoDB via saveLog()  
**Target:** 
- Structured logging (Winston/Pino)
- Error tracking (Sentry/AppInsights)
- Same MongoDB logging for consistency

### 4. State Management
**Current:** MongoDB stores course state, async updates  
**Target:** Same pattern
- Ensure atomic updates
- Handle concurrent modifications
- Progress tracking

### 5. Rate Limiting
**OpenAI API:** Has rate limits, need to handle properly
- Queue requests
- Retry with backoff
- Monitor usage

### 6. File Storage
**Azure Blob Storage:** Still used for images/audio  
**Target:** Keep same, just ensure proper SDK integration

---

## 🧪 Testing Strategy

### Per Flow Testing
1. **Unit Tests:** Each service/function
2. **Integration Tests:** Full flow with mocked external APIs
3. **E2E Tests:** Real API calls (in test environment)
4. **Comparison Tests:** Output parity with Azure Function

### Test Data
- Use existing test courses
- Create isolated test DB
- Mock external APIs for speed

### Performance Benchmarks
- Response time < 500ms (before async)
- Async processing time similar to current
- Memory usage acceptable
- No memory leaks

---

## 📊 Progress Tracking

### Current Status
- [x] Planning document created
- [x] Dependencies analyzed
- [ ] Project structure created
- [ ] First flow (generateByTitle) migrated
- [ ] First flow tested and validated

### Success Criteria
✅ Each flow produces identical output to Azure Function  
✅ Performance is equal or better  
✅ All error cases handled  
✅ Logs maintained for debugging  
✅ No regressions in existing functionality  

---

## 🔗 Next Steps

1. **Create project structure** (Next)
2. **Set up database connection**
3. **Migrate `generateByTitle` flow**
4. **Test against production data**
5. **Iterate on remaining flows**

---

## 📝 Notes

- Keep Azure Function running until all flows validated
- Use feature flags if deploying to same infrastructure
- Monitor MongoDB performance with new connection patterns
- Consider splitting CreateContent into microservices later if complexity grows
- Document any differences in behavior (hopefully none!)

