<template>
  <div class="story-slug">
    <ContainerPhotoGallery v-if="isStylePhotography" :story="story" />

    <ContainerCulturePost v-else-if="isStyleWide" :story="story" />

    <div v-else class="article">
      <ContainerHeader :currentSectionName="sectionName" />

      <div class="story-container">
        <ClientOnly>
          <ContainerGptAd class="story__ad" :pageKey="sectionId" adKey="HD" />
        </ClientOnly>

        <div class="story-wrapper">
          <ContainerStoryBody :story="story" class="story-slug__story-body">
            <template #fixedTriggerEnd>
              <div ref="fixedTriggerEnd" />
            </template>

            <template #storyRelateds>
              <UiStoryListWithArrow
                class="story__list"
                :categoryTitle="categoryTitle"
                :items="relateds"
                :sectionName="sectionName"
              />

              <LazyRenderer
                v-if="relatedsWithoutFirstTwo.length > 0"
                class="story__list"
                @load="handleShowStoryListRelated"
              >
                <UiStoryListRelated
                  :items="relatedsWithoutFirstTwo"
                  :images="relatedImages"
                >
                  <template v-if="canAdvertise" #ads>
                    <ClientOnly>
                      <MicroAd
                        v-for="unit in microAdUnits[device]"
                        :key="unit.name"
                        :unitId="unit.id"
                      />

                      <div id="_popIn_recommend"></div>
                    </ClientOnly>
                  </template>
                </UiStoryListRelated>
              </LazyRenderer>
            </template>

            <template v-if="canAdvertise && isDesktopWidth" #dableWidget>
              <ClientOnly>
                <div class="dable-widget">
                  <LazyRenderer
                    :id="`dablewidget_${DABLE_WIDGET_IDS.PC}`"
                    :data-widget_id="DABLE_WIDGET_IDS.PC"
                    @load="handleShowDableWidget"
                  ></LazyRenderer>
                </div>
              </ClientOnly>
            </template>
          </ContainerStoryBody>

          <aside>
            <ClientOnly>
              <ContainerGptAd
                class="story__ad"
                :pageKey="sectionId"
                adKey="PC_R1"
              />

              <LazyRenderer v-if="!isDesktopWidth" class="story__fb-page">
                <FbPage />
              </LazyRenderer>

              <ContainerGptAd
                class="story__ad"
                :pageKey="sectionId"
                adKey="MB_E1"
              />

              <div v-if="canAdvertise && !isDesktopWidth" class="dable-widget">
                <LazyRenderer
                  :id="`dablewidget_${DABLE_WIDGET_IDS.MB}`"
                  :data-widget_id="DABLE_WIDGET_IDS.MB"
                  @load="handleShowDableWidget"
                ></LazyRenderer>
              </div>

              <div v-if="shouldOpenLatestList" ref="latestList">
                <LazyRenderer
                  class="lazy-latest-list"
                  :style="{
                    height: doesHaveLatestStories ? undefined : '100vh',
                  }"
                  @load="fetchLatestStories"
                >
                  <UiStoryListWithHeading
                    class="latest-list"
                    heading="最新文章"
                    :items="latestStories"
                    :extractTitle="sectionCategory"
                  />
                </LazyRenderer>
              </div>

              <div
                ref="fixedContainer"
                class="fixed-container"
                :class="{ fixed: shouldFixAside }"
              >
                <ContainerGptAd
                  class="story__ad"
                  :pageKey="sectionId"
                  adKey="PC_R2"
                />

                <LazyRenderer
                  class="story__popular-list"
                  @load="fetchPopularStories"
                >
                  <UiStoryListWithHeading
                    v-if="doesHavePopularStories"
                    heading="熱門文章"
                    :items="popularStories"
                  />
                </LazyRenderer>

                <LazyRenderer v-if="isDesktopWidth" class="story__fb-page">
                  <FbPage />
                </LazyRenderer>
              </div>
            </ClientOnly>
          </aside>
        </div>

        <ClientOnly>
          <ContainerGptAd
            class="story__ad story__ad--ft"
            :pageKey="sectionId"
            adKey="FT"
          />
        </ClientOnly>

        <UiAdultContentWarning v-if="story.isAdult" />

        <ClientOnly v-if="shouldOpenAdPcFloating">
          <div class="ad-pc-floating">
            <ContainerGptAd
              :pageKey="sectionCarandwatchId"
              adKey="PC_FLOATING"
            />
            <SvgCloseIcon @click="doesClickCloseAdPcFloating = true" />
          </div>
        </ClientOnly>

        <ContainerFullScreenAds v-if="!hasWineCategory && canAdvertise" />
      </div>

      <div class="sticky-footer">
        <AppOpenNotification v-if="false" />

        <UiStickyAd v-if="!hasWineCategory && canAdvertise">
          <ContainerGptAd :pageKey="sectionId" adKey="MB_ST" />
        </UiStickyAd>

        <UiWineWarning v-if="hasWineCategory" />
      </div>

      <div class="footer-container">
        <UiFooter />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'

import { useViewport } from '~/composition/viewport.js'
import { useFbQuotePlugin } from '~/composition/fb-plugins.js'

import ContainerHeader from '~/components/ContainerHeader.vue'
import ContainerPhotoGallery from '~/components/photo-gallery/ContainerPhotoGallery.vue'
import ContainerCulturePost from '~/components/culture-post/ContainerCulturePost.vue'
import ContainerStoryBody from '~/components/ContainerStoryBody.vue'
import UiAdultContentWarning from '~/components/UiAdultContentWarning.vue'
import UiStoryListRelated from '~/components/UiStoryListRelated.vue'
import UiStoryListWithArrow from '~/components/UiStoryListWithArrow.vue'
import FbPage from '~/components/FbPage.vue'
import UiStoryListWithHeading from '~/components/UiStoryListWithHeading.vue'
import ContainerGptAd from '~/components/ContainerGptAd.vue'
import UiStickyAd from '~/components/UiStickyAd.vue'
import ContainerFullScreenAds from '~/components/ContainerFullScreenAds.vue'
import MicroAd from '~/components/MicroAd.vue'
import UiWineWarning from '~/components/UiWineWarning.vue'
import AppOpenNotification from '~/components/AppOpenNotification.vue'
import UiFooter from '~/components/UiFooter.vue'

import SvgCloseIcon from '~/assets/close-black.svg?inline'

import { DOMAIN_NAME, ENV } from '~/configs/config'
import {
  SECTION_IDS,
  SITE_OG_IMG,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_URL,
} from '~/constants/index'
import { DABLE_WIDGET_IDS, MICRO_AD_UNITS } from '~/constants/ads.js'

export default {
  name: 'Story',
  layout: 'empty',
  setup() {
    useViewport()
    useFbQuotePlugin()
  },
  components: {
    ContainerHeader,
    ContainerPhotoGallery,
    ContainerCulturePost,
    ContainerStoryBody,
    UiAdultContentWarning,
    UiStoryListRelated,
    UiStoryListWithArrow,
    FbPage,
    UiStoryListWithHeading,

    ContainerGptAd,
    UiStickyAd,
    ContainerFullScreenAds,
    MicroAd,

    AppOpenNotification,
    UiWineWarning,

    UiFooter,

    SvgCloseIcon,
  },

  async fetch() {
    const [postResponse] = await Promise.allSettled([
      this.$fetchPosts({
        slug: this.storySlug,
        isAudioSiteOnly: false,
        clean: 'content',
        related: 'article',
      }),
      this.$store.dispatch('partners/fetchPartnersData'),
      this.$store.dispatch('topics/fetchTopicsData'),
    ])

    if (postResponse.status === 'fulfilled') {
      this.story = postResponse.value.items?.[0] ?? {}

      this.$store.commit(
        'setCanAdvertise',
        !this.story.hiddenAdvertised ?? true
      )
    }
  },

  data() {
    return {
      latestStories: [],
      hasLoadedLatestStories: false,

      popularStories: [],
      story: {},
      relatedImages: [],

      microAdUnits: MICRO_AD_UNITS.STORY,

      DABLE_WIDGET_IDS,
      shouldLoadDableScript: false,

      shouldLoadPopinScript: false,

      sectionCarandwatchId: SECTION_IDS.carandwatch,
      doesClickCloseAdPcFloating: false,

      shouldFixAside: false,
    }
  },

  computed: {
    ...mapState({
      canAdvertise: (state) => state.canAdvertise,
      viewportHeight: (state) => state.viewport.height,
    }),
    ...mapGetters({
      isDesktopWidth: 'viewport/isViewportWidthUpLg',
    }),

    isStyleDefault() {
      return !this.isStylePhotography && !this.isStyleWide
    },
    isStylePhotography() {
      return this.story.style === 'photography'
    },
    isStyleWide() {
      return this.story.style === 'wide'
    },

    device() {
      return this.isDesktopWidth ? 'PC' : 'MB'
    },
    categories() {
      return this.story.categories || []
    },
    category() {
      return this.categories[0] || {}
    },
    hasCategory() {
      return !_.isEmpty(this.category)
    },
    categoryTitle() {
      return this.category.title ?? ''
    },
    hasWineCategory() {
      return Boolean(
        this.categories.find((category) => category.name === 'wine')
      )
    },
    relateds() {
      return (this.story.relateds ?? []).filter((item) => item.slug)
    },
    relatedsWithoutFirstTwo() {
      return this.relateds.slice(2)
    },
    section() {
      return this.story.sections?.[0] || {}
    },
    hasSection() {
      return !_.isEmpty(this.section)
    },
    sectionId() {
      return this.section.id ?? 'other'
    },
    storySlug() {
      return this.$route.params.slug
    },
    sectionName() {
      return this.section.name ?? ''
    },
    sectionTitle() {
      return this.section.title ?? ''
    },
    shouldOpenLatestList() {
      return (
        this.isDesktopWidth &&
        this.sectionId !== 'other' &&
        (this.hasLoadedLatestStories ? this.doesHaveLatestStories : true)
      )
    },
    doesHaveLatestStories() {
      return this.latestStories.length > 0
    },
    doesHavePopularStories() {
      return this.popularStories.length > 0
    },

    shouldOpenAdPcFloating() {
      return (
        this.sectionId === this.sectionCarandwatchId &&
        this.canAdvertise &&
        this.isDesktopWidth &&
        !this.doesClickCloseAdPcFloating
      )
    },
  },

  watch: {
    isDesktopWidth() {
      if (this.isStyleDefault) {
        this.isDesktopWidth
          ? window.addEventListener('scroll', this.handleFixAside)
          : this.cleanFixedAside()
      }
    },
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleFixAside)
  },

  methods: {
    handleShowStoryListRelated() {
      this.fetchRelatedImages()

      this.shouldLoadPopinScript = true
    },
    async fetchRelatedImages() {
      const imageIds = this.relatedsWithoutFirstTwo.map(
        (item) => item.heroImage
      )

      const { items = [] } = await this.$fetchImages({ id: imageIds })
      this.relatedImages = items
    },
    async fetchLatestStories() {
      if (this.sectionId === 'other') {
        return
      }

      const { items = [] } = await this.$fetchList({
        sort: '-publishedDate',
        sections: this.sectionId,
      })

      this.latestStories = items
        .filter(this.doesNotHaveCurrentStorySlug)
        .slice(0, 6)

      this.hasLoadedLatestStories = true
    },
    async fetchPopularStories() {
      if (ENV === 'lighthouse') {
        return
      }

      const { report: items = [] } = await this.$fetchPopular()
      this.popularStories = items.slice(0, 9)
    },
    sectionCategory(item = {}) {
      return item.categories?.[0]?.title || '新聞'
    },
    doesNotHaveCurrentStorySlug(item) {
      return item.slug !== this.storySlug
    },
    handleShowDableWidget() {
      this.shouldLoadDableScript = true
    },
    handleFixAside: _.throttle(function () {
      const { latestList, fixedContainer, fixedTriggerEnd } = this.$refs

      if (!latestList) {
        return
      }

      const { bottom: latestListBottom } = latestList.getBoundingClientRect()
      const {
        top: fixedTriggerEndTop,
      } = fixedTriggerEnd.getBoundingClientRect()

      // 當視窗頂部 <= latestList 底部，結束 fix
      if (latestListBottom > 0) {
        this.shouldFixAside = false
        fixedContainer.style.marginTop = ''

        return
      }

      // 當視窗頂部 > latestList 底部，且視窗底部 <= fixedTriggerEnd 頂部，開始 fix
      if (
        latestListBottom <= 0 &&
        fixedTriggerEndTop - this.viewportHeight > 0
      ) {
        this.shouldFixAside = true
        fixedContainer.style.marginTop = ''

        return
      }

      // 當視窗底部 > fixedTriggerEnd 頂部，結束 fix
      if (fixedTriggerEndTop - this.viewportHeight <= 0) {
        this.shouldFixAside = false
        fixedContainer.style.marginTop = `${
          fixedTriggerEndTop - latestListBottom - this.viewportHeight
        }px`
      }
    }, 100),
    cleanFixedAside() {
      const { fixedContainer } = this.$refs

      this.shouldFixAside = false
      fixedContainer.style.marginTop = ''

      window.removeEventListener('scroll', this.handleFixAside)
    },
  },
  head() {
    const {
      brief = {},
      heroImage = {},
      isAdult = false,
      ogDescription = '',
      ogImage = {},
      ogTitle = '',
      publishedDate = Date.now(),
      updatedAt = Date.now(),
      title = '',
      topics = {},
      writers = [],
      tags = [],
    } = this.story
    const robots = isAdult ? 'noindex' : 'index'
    const metaTitle = ogTitle || title || SITE_TITLE
    const description =
      ogDescription ||
      brief.apiData
        ?.find((item) => item.type === 'unstyled')
        ?.content?.[0]?.replace(/<\/?[^>]+(>|$)/gm, '') ||
      ''
    const imgUrl =
      ogImage?.image?.resizedTargets?.tablet?.url ||
      heroImage?.image?.resizedTargets?.tablet?.url ||
      SITE_OG_IMG
    const pageUrl = `https://${DOMAIN_NAME}${this.$route.path}`

    const publishedDateIso = new Date(publishedDate).toISOString()
    const topicId = topics._id ?? ''
    const { name: writerName, id: writerId } = writers[0] || {}
    const tagNamesStr = tags.map((tag) => tag.name).join(', ')

    return {
      title,
      meta: [
        { hid: 'robots', name: 'robots', content: robots },
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:title', property: 'og:title', content: metaTitle },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
        { hid: 'og:image', property: 'og:image', content: imgUrl },
        {
          hid: 'og:url',
          property: 'og:url',
          content: pageUrl,
        },
        tagNamesStr !== ''
          ? {
              name: 'news_keywords',
              content: tagNamesStr,
            }
          : {},
        this.hasSection
          ? { name: 'section-name', content: this.sectionName }
          : {},
        this.hasCategory
          ? { name: 'category-name', content: this.category.name }
          : {},
        { name: 'topic-id', content: topicId },
        { hid: 'twitter:title', name: 'twitter:title', content: metaTitle },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content: description,
        },
        { hid: 'twitter:image', name: 'twitter:image', content: imgUrl },
        { property: 'dable:item_id', content: this.storySlug },
        { property: 'dable:author', content: writerName },
        this.hasSection
          ? {
              property: 'article:section',
              content: this.sectionTitle,
            }
          : {},
        this.hasCategory
          ? { property: 'article:section2', content: this.categoryTitle }
          : {},
        { property: 'article:published_time', content: publishedDateIso },
      ],
      link: [
        { rel: 'canonical', href: pageUrl },
        { rel: 'amphtml', href: `${SITE_URL}/story/amp/${this.storySlug}/` },
        {
          hid: 'gptLink',
          skip: !this.canAdvertise,
          rel: 'preload',
          href: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
          as: 'script',
        },
      ],
      script: [
        ...jsonLds.bind(this)(),
        {
          hid: 'gptScript',
          skip: !this.canAdvertise,
          src: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
          async: true,
        },
        {
          hid: 'dable',
          skip: !this.shouldLoadDableScript,
          innerHTML: `
            (function (d, a, b, l, e, _) {
              if (d[b] && d[b].q) return
              d[b] = function () {
                ;(d[b].q = d[b].q || []).push(arguments)
              }
              e = a.createElement(l)
              e.async = 1
              e.charset = 'utf-8'
              e.src = '//static.dable.io/dist/plugin.min.js'
              _ = a.getElementsByTagName(l)[0]
              _.parentNode.insertBefore(e, _)
            })(window, document, 'dable', 'script')
            dable('setService', 'mirrormedia.mg')
            dable('sendLogOnce')
            dable('renderWidget', 'dablewidget_${DABLE_WIDGET_IDS.MB}')
            dable('renderWidget', 'dablewidget_${DABLE_WIDGET_IDS.PC}')
          `,
        },
        {
          hid: 'popinAd',
          skip: !this.shouldLoadPopinScript,
          innerHTML: `
            (function () {
              var pa = document.createElement('script')
              pa.type = 'text/javascript'
              pa.charset = 'utf-8'
              pa.async = true

              pa.src =
                window.location.protocol +
                '//api.popin.cc/searchbox/mirrormedia_tw.js'

              var s = document.getElementsByTagName('script')[0]
              s.parentNode.insertBefore(pa, s)
            })()
          `,
        },
      ],
      __dangerouslyDisableSanitizersByTagID: {
        dable: ['innerHTML'],
        popinAd: ['innerHTML'],
      },
    }

    function jsonLds() {
      let jsonLdNewsArticle
      const jsonLdBreadcrumbList = {
        type: 'application/ld+json',
        json: {
          '@context': 'http://schema.org/',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbList.bind(this)(),
        },
      }

      {
        const hasWriter = writers[0] !== undefined
        const authorName = hasWriter ? writerName : '鏡週刊'
        const logoUrl = require('~/assets/logo.png')

        jsonLdNewsArticle = {
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org/',
            '@type': 'NewsArticle',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': pageUrl,
            },
            headline: title,
            image: imgUrl,
            datePublished: publishedDateIso,
            dateModified: new Date(updatedAt).toISOString(),
            author: {
              '@type': hasWriter ? 'Person' : 'Organization',
              name: authorName,
            },
            publisher: {
              '@type': 'Organization',
              name: SITE_TITLE,
              logo: {
                '@type': 'ImageObject',
                url: logoUrl,
              },
            },
            description,
            url: pageUrl,
            thumbnailUrl: imgUrl,
            articleSection: this.hasSection ? this.sectionTitle : undefined,
          },
        }

        if (hasWriter) {
          const jsonLdPerson = {
            type: 'application/ld+json',
            json: {
              '@context': 'http://schema.org/',
              '@type': 'Person',
              name: authorName,
              url: `${SITE_URL}/author/${writerId}/`,
              brand: {
                '@type': 'Brand',
                name: SITE_TITLE,
                url: SITE_URL,
                image: logoUrl,
                logo: logoUrl,
                description: SITE_DESCRIPTION,
              },
            },
          }

          return [jsonLdNewsArticle, jsonLdPerson, jsonLdBreadcrumbList]
        }
      }

      return [jsonLdNewsArticle, jsonLdBreadcrumbList]
    }

    function breadcrumbList() {
      const items = [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_TITLE,
          item: SITE_URL,
        },
      ]

      if (this.hasSection) {
        items.push({
          '@type': 'ListItem',
          position: items.length + 1,
          name: this.sectionTitle,
          item: `${SITE_URL}/section/${this.sectionName}`,
        })
      }

      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: title,
        item: pageUrl,
      })

      return items
    }
  },
}
</script>

<style lang="scss" scoped>
@import '~/css/micro-ad/story.scss';

$story-max-width: 1160px;
$story-padding-right-lg: 50px;

$aside-width: 300px;

.story-slug {
  &__story-body {
    max-width: 645px;
    padding-top: 20px;
    padding-bottom: 20px;
    margin-left: auto;
    margin-right: auto;
    @include media-breakpoint-up(lg) {
      width: calc(100% - #{$aside-width} - 20px);
      max-width: 695px;
      padding-bottom: 0;
      margin-left: 0;
    }
  }
}

.article {
  @include media-breakpoint-up(lg) {
    background-color: #414141;
  }
}

.story-container {
  max-width: $story-max-width;
  padding-top: 20px;
  padding-bottom: 40px;
  overflow: hidden;
  @include media-breakpoint-up(lg) {
    margin: 0 auto;
    padding-left: 50px;
    padding-right: $story-padding-right-lg;
    background-color: #fff;
  }
  @include media-breakpoint-up(xl) {
    padding-bottom: 20px;
  }
}

.story-wrapper {
  position: relative;
  @include media-breakpoint-up(lg) {
    padding-top: 30px;
    padding-bottom: 20px;
    display: flex;
  }
}

.story {
  &__list {
    margin-top: 20px;
  }

  &__popular-list {
    margin-bottom: 20px;
  }

  &__fb-page {
    margin-bottom: 20px;
    @include media-breakpoint-up(lg) {
      margin-bottom: 0;
    }
  }

  &__ad {
    width: 100%;
    margin-bottom: 20px;

    &--ft {
      margin-bottom: 0;
    }
  }
}

aside {
  max-width: 645px;
  margin-bottom: 40px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  @include media-breakpoint-up(lg) {
    width: $aside-width;
    margin-right: 0;
    margin-bottom: 0;
  }

  > * {
    width: calc(100% - 50px);
    margin-left: auto;
    margin-right: auto;

    @include media-breakpoint-up(lg) {
      width: 100%;
    }
  }
}

.fixed-container {
  @include media-breakpoint-up(lg) {
    padding-top: 20px;

    &.fixed {
      position: fixed;
      top: 0;
      right: calc(
        (100% - #{$story-max-width}) / 2 + #{$story-padding-right-lg}
      );
      width: $aside-width;
    }
  }
}

.footer-container {
  margin-bottom: 100px;
  @include media-breakpoint-up(lg) {
    margin-bottom: 0;
    max-width: $story-max-width;
    margin-left: auto;
    margin-right: auto;
    background-color: #fff;
  }
}

.sticky-footer {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 419;

  > * {
    position: relative;
  }
}

.dable-widget {
  margin-bottom: 20px;
  @include media-breakpoint-up(lg) {
    margin-top: 1.5em;
    margin-bottom: 0;
  }
}

.ad-pc-floating {
  position: fixed;
  top: 175px;
  right: 15px;

  svg {
    position: absolute;
    top: -12.5px;
    right: -12.5px;
    width: 25px;
    height: auto;
    cursor: pointer;
    user-select: none;
  }
}

#_popIn_recommend {
  &::v-deep {
    ._popIn_recommend_container {
      padding-bottom: 0;
    }

    ._popIn_recommend_article {
      &::before {
        flex-shrink: 0;
        position: static;
        height: auto;
      }
    }

    ._popIn_recommend_art_title {
      flex-grow: 1;
      margin-left: 0;
      white-space: normal;
      @include media-breakpoint-up(md) {
        padding-left: 32px;
        padding-right: 32px;
      }

      a {
        display: block;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    ._popIn_recommend_art_img {
      flex-shrink: 0;
      width: 33%;
      padding-top: calc(33% * 0.75);
      @include media-breakpoint-up(md) {
        width: 25%;
        padding-top: calc(25% * 0.75);
      }
      @include media-breakpoint-up(lg) {
        width: 20%;
        padding-top: calc(20% * 0.75);
      }
    }
  }
}
</style>
