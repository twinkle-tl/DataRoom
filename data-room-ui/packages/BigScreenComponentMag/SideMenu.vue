<template>
  <div class="side-catalog-wrap">
    <el-scrollbar class="side-catalog-box">
      <div
        v-for="(com, index) in componentList"
        :key="index"
        class="side-catalog-item"
        :class="{ 'active-catalog': activeType === com.type }"
        @click="componentHandle(com)"
      >
        {{ com.name }}
      </div>
    </el-scrollbar>
  </div>
</template>
<script>
export default {
  components: {},
  data () {
    return {
      componentList: [
        {
          name: '自定义组件',
          type: 'component'
        },
        {
          name: '业务组件',
          type: 'bizComponent'
        },
        {
          name: '系统组件',
          type: 'system'
        }
      ],
      activeType: 'component'
    }
  },
  watch: {
    $route: {
      handler (val) {
        const { globalData } = this.$router.app.$options
        if (globalData?.componentsManagementType) {
          this.activeType = globalData.componentsManagementType
          this.$emit('getPageInfo', globalData.componentsManagementType)
          // 清除this.$router.app.$options.globalData.componentsManagementType
          delete globalData.componentsManagementType
        }
      },
      immediate: true
    }
  },
  created () { },
  methods: {
    // 点击左侧组件
    componentHandle (com) {
      this.activeType = com.type
      this.$emit('getPageInfo', com.type)
    }
  }
}
</script>
<style lang="scss" scoped>
  @import '../assets/style/layout.scss';
</style>
