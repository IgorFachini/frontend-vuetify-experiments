<template>
  <v-container>
    <v-row v-if="video">
      <v-col cols="12" lg="8">
        <!-- Video Player -->
        <v-card class="mb-4">
          <video
            ref="videoPlayer"
            class="video-js vjs-big-play-centered"
            controls
            preload="auto"
            :src="video.url"
            style="aspect-ratio: 16/9;"
            width="100%"
          />
        </v-card>

        <!-- Video Info -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            {{ video.title }}
          </v-card-title>

          <v-card-text>
            <div class="text-body-1 mb-4">
              {{ video.description }}
            </div>
            <div class="text-caption text-grey">
              Uploaded on {{ new Date(video.createdAt).toLocaleDateString() }}
            </div>
          </v-card-text>

          <v-card-actions v-if="canEdit">
            <v-spacer />
            <v-btn
              color="error"
              prepend-icon="mdi-delete"
              variant="text"
              @click="confirmDelete"
            >
              Delete Video
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-pencil"
              variant="text"
              @click="showEditDialog = true"
            >
              Edit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <!-- Related Videos -->
        <v-card>
          <v-card-title>Related Videos</v-card-title>
          <v-list>
            <v-list-item
              v-for="relatedVideo in relatedVideos"
              :key="relatedVideo.id"
              class="related-video-item"
              :to="{ name: 'Video', params: { id: relatedVideo.id }}"
            >
              <template #prepend>
                <v-img
                  :aspect-ratio="16/9"
                  class="rounded"
                  cover
                  :src="relatedVideo.thumbnail || '/placeholder-video.png'"
                  width="120"
                />
              </template>

              <v-list-item-title class="text-truncate mb-1">
                {{ relatedVideo.title }}
              </v-list-item-title>

              <v-list-item-subtitle class="text-truncate">
                {{ new Date(relatedVideo.createdAt).toLocaleDateString() }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-else-if="loading">
      <v-col class="text-center" cols="12">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        />
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else>
      <v-col class="text-center" cols="12">
        <v-icon
          class="mb-4"
          color="error"
          icon="mdi-alert-circle"
          size="64"
        />
        <div class="text-h6">Video not found</div>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Video</v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="handleEdit">
            <v-text-field
              v-model="editedVideo.title"
              class="mb-4"
              label="Title"
              required
              :rules="[v => !!v || 'Title is required']"
            />

            <v-textarea
              v-model="editedVideo.description"
              label="Description"
              rows="3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showEditDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="handleEdit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Video?</v-card-title>
        <v-card-text>
          This action cannot be undone. Are you sure you want to delete this video?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="handleDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { PandaVideoService } from '@/services/pandavideo.service'
  import { useAuthStore } from '@/stores/auth'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  const video = ref(null)
  const relatedVideos = ref([])
  const loading = ref(true)
  const saving = ref(false)
  const deleting = ref(false)
  const showEditDialog = ref(false)
  const showDeleteDialog = ref(false)
  const editForm = ref()

  const editedVideo = ref({
    title: '',
    description: '',
  })

  const canEdit = computed(() => {
    return video.value?.userId === authStore.user?.id
  })

  async function loadVideo () {
    loading.value = true
    try {
      video.value = await PandaVideoService.getVideo(route.params.id as string)
      editedVideo.value = {
        title: video.value.title,
        description: video.value.description,
      }
      await loadRelatedVideos()
    } catch (error) {
      console.error('Failed to load video:', error)
      video.value = null
    } finally {
      loading.value = false
    }
  }

  async function loadRelatedVideos () {
    try {
      // In a real app, you would have an API endpoint for related videos
      // For now, we'll just load all videos and filter out the current one
      const allVideos = await PandaVideoService.listVideos()
      relatedVideos.value = allVideos
        .filter(v => v.id !== video.value.id)
        .slice(0, 5)
    } catch (error) {
      console.error('Failed to load related videos:', error)
    }
  }

  function confirmDelete () {
    showDeleteDialog.value = true
  }

  async function handleEdit () {
    const { valid } = await editForm.value.validate()
    if (!valid) return

    saving.value = true
    try {
      await PandaVideoService.updateVideo(video.value.id, editedVideo.value)
      await loadVideo()
      showEditDialog.value = false
    } catch (error) {
      console.error('Failed to update video:', error)
    } finally {
      saving.value = false
    }
  }

  async function handleDelete () {
    deleting.value = true
    try {
      await PandaVideoService.deleteVideo(video.value.id)
      router.push({ name: 'Home' })
    } catch (error) {
      console.error('Failed to delete video:', error)
    } finally {
      deleting.value = false
      showDeleteDialog.value = false
    }
  }

  onMounted(() => {
    loadVideo()
  })
</script>

<style scoped>
.video-js {
  width: 100%;
}

.related-video-item {
  cursor: pointer;
}

.related-video-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>
