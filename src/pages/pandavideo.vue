<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">{{ t('pandavideo.title') }}</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-video-plus"
            @click="showUploadDialog = true"
          >
            {{ t('pandavideo.uploadButton') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="video in videos"
        :key="video.id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-card
          class="video-card"
          :to="{ name: 'Video', params: { id: video.id }}"
        >
          <v-img
            :aspect-ratio="16/9"
            class="bg-grey-lighten-2"
            cover
            :src="video.thumbnail || '/placeholder-video.png'"
          >
            <template #placeholder>
              <v-row
                align="center"
                class="fill-height ma-0"
                justify="center"
              >
                <v-progress-circular
                  color="grey-lighten-5"
                  indeterminate
                />
              </v-row>
            </template>
          </v-img>

          <v-card-title class="text-truncate">
            {{ video.title }}
          </v-card-title>

          <v-card-text>
            <div class="text-truncate">{{ video.description }}</div>
            <div class="mt-2 text-caption text-grey">
              {{ new Date(video.createdAt).toLocaleDateString() }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="videos.length === 0" class="text-center" cols="12">
        <v-icon
          class="mb-4 text-grey"
          icon="mdi-video-off"
          size="64"
        />
        <div class="text-h6 text-grey">{{ t('pandavideo.noVideos') }}</div>
      </v-col>
    </v-row>

    <!-- Upload Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500">
      <v-card>
        <v-card-title>{{ t('pandavideo.uploadTitle') }}</v-card-title>
        <v-card-text>
          <v-form ref="uploadForm" @submit.prevent="handleUpload">
            <v-text-field
              v-model="newVideo.title"
              class="mb-4"
              :label="t('pandavideo.videoTitle')"
              required
              :rules="[v => !!v || t('pandavideo.titleRequired')]"
            />

            <v-textarea
              v-model="newVideo.description"
              class="mb-4"
              :label="t('pandavideo.description')"
              rows="3"
            />

            <v-file-input
              v-model="newVideo.file"
              accept="video/*"
              class="mb-4"
              :label="t('pandavideo.videoFile')"
              required
              :rules="[v => !!v || t('pandavideo.fileRequired')]"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showUploadDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="uploading"
            @click="handleUpload"
          >
            {{ t('common.upload') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { PandaVideoService } from '@/services/pandavideo.service'

  const { t } = useI18n()
  const videos = ref([])
  const showUploadDialog = ref(false)
  const uploadForm = ref()
  const uploading = ref(false)

  const newVideo = ref({
    title: '',
    description: '',
    file: null,
  })

  async function loadVideos () {
    try {
      videos.value = await PandaVideoService.listVideos()
    } catch (error) {
      console.error('Failed to load videos:', error)
    }
  }

  async function handleUpload () {
    const { valid } = await uploadForm.value.validate()
    if (!valid) return

    uploading.value = true
    try {
      await PandaVideoService.uploadVideo(
        newVideo.value.file,
        newVideo.value.title,
        newVideo.value.description,
      )
      showUploadDialog.value = false
      await loadVideos()
    } catch (error) {
      console.error('Failed to upload video:', error)
    } finally {
      uploading.value = false
    }
  }

  onMounted(() => {
    loadVideos()
  })
</script>

<style scoped>
.video-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-card .v-card-title {
  font-size: 1.1rem;
  line-height: 1.4;
}
</style>
