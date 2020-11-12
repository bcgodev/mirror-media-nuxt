<template>
  <div class="story-list">
    <div class="story-list__heading" v-text="heading" />
    <div class="story-list__list">
      <div
        v-for="item in items"
        :key="item.slug"
        :class="[sectionName(item), 'item']"
      >
        <a
          :href="href(item)"
          class="item__image"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            :src="imgSrc(item)"
            :srcset="imgSrcset(item)"
            :alt="item.title"
          />
          <div class="item__section">{{ extractTitle(item) }}</div>
        </a>
        <div class="item__section-title">
          <div class="item__section">{{ extractTitle(item) }}</div>
          <a
            :href="href(item)"
            class="item__title"
            target="_blank"
            rel="noopener noreferrer"
            v-text="item.title"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { SITE_OG_IMG } from '~/constants/index.js'

export default {
  name: 'UiStoryListWithHeading',
  props: {
    heading: {
      type: String,
      required: true,
      default: '',
    },
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
    extractTitle: {
      type: Function,
      default(...args) {
        return this.sectionTitle(...args)
      },
    },
  },

  methods: {
    imgSrc(item) {
      return this.heroImgTiny(item)
    },
    imgSrcset(item) {
      const tinyUrl = this.heroImgTiny(item)
      const mobileUrl = this.heroImg(item).mobile?.url || SITE_OG_IMG

      return `${tinyUrl} 1x, ${mobileUrl} 2x`
    },
    heroImg({ heroImage = {} }) {
      return heroImage.image?.resizedTargets || {}
    },
    heroImgTiny(item) {
      return this.heroImg(item).tiny?.url || SITE_OG_IMG
    },
    section({ sections = [] }) {
      return sections[0] || {}
    },
    sectionName(item) {
      return this.section(item).name
    },
    sectionTitle(item = {}) {
      return this.section(item).title || '新聞'
    },
    href({ slug }) {
      return `/story/${slug}/`
    },
  },
}
</script>

<style lang="scss" scoped>
.story-list {
  color: #34495e;
  &__heading {
    font-size: 24px;
    font-weight: 700;
    @include media-breakpoint-up(lg) {
      padding: 6px 18px;
      color: #fff;
      font-size: 18px;
      background-color: #0c5a80;
    }
    + * {
      margin-top: 20px;
      @include media-breakpoint-up(lg) {
        margin-top: 0;
      }
    }
  }
  &__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: flex-start;
    @include media-breakpoint-up(lg) {
      padding: 18px;
      border-bottom: 1px solid #dedede;
      border-right: 1px solid #dedede;
      border-left: 1px solid #dedede;
    }
  }
  .item {
    position: relative;
    width: calc(50% - 5px);
    @include media-breakpoint-up(lg) {
      display: flex;
      width: 100%;
    }
    &:first-child {
      width: 100%;
      .item__title {
        -webkit-line-clamp: 2;
        max-height: calc(24px * 2);
        @include media-breakpoint-up(lg) {
          -webkit-line-clamp: 3;
          max-height: none;
        }
      }
    }
    + .item {
      margin-top: 20px;
    }
    &__image {
      position: relative;
      display: block;
      padding-top: 66.66%;
      @include media-breakpoint-up(lg) {
        width: 50%;
        margin-right: 10px;
        padding: 0;
      }
      img {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
      }
      .item__section {
        @include media-breakpoint-up(lg) {
          display: none;
        }
      }
    }
    &__section-title {
      @include media-breakpoint-up(lg) {
        flex: 1;
      }
      .item__section {
        display: none;
        @include media-breakpoint-up(lg) {
          display: inline-block;
          position: static;
          + * {
            margin-top: 12px;
          }
        }
      }
    }
    &__section {
      position: absolute;
      left: 0;
      bottom: 0;
      display: inline-block;
      padding: 0 10px;
      color: #fff;
      font-size: 14px;
      line-height: 25px;
      background-color: #000;
    }
    &__title {
      display: -webkit-box;
      margin: 4px 0 0;
      color: #34495e;
      font-size: 19px;
      line-height: 24px;
      text-align: justify;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      max-height: calc(24px * 3);
      overflow: hidden;
      @include media-breakpoint-up(lg) {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.15;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        height: calc(16px * 1.14 * 3);
      }
    }
    @each $name, $color in $sections-color {
      &.#{$name} {
        .item__section {
          background-color: $color;
        }
      }
    }
  }
}
</style>