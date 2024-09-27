<template>
  <div class="big-screen-list-wrap">
    <div class="internal-box">
      <div class="top-search-wrap">
        <el-input v-model="searchKey" class="bs-el-input bs-el-input-search"
          :placeholder="type === 'bigScreenCatalog' ? '请输入大屏名称' : '请输入组件名称'" prefix-icon="el-icon-search" clearable
          @clear="reSearch" @keyup.enter.native="reSearch" />
        <el-button type="primary" @click="reSearch">
          搜索
        </el-button>
      </div>
      <div v-loading="loading" class="list-wrap bs-scrollbar" element-loading-text="加载中" :style="{
        display: gridComputed ? 'grid' : 'flex',
        justifyContent: gridComputed ? 'space-around' : 'flex-start'
      }">
        <!-- 第一个是新增大屏卡片 -->
        <div class="big-screen-card-wrap" :style="{
          width: gridComputed ? 'auto' : '290px'
        }" @click="add">
          <div class="big-screen-card-inner big-screen-card-inner-add">
            <div class="add-big-screen-card">
              <div class="add-big-screen-card-inner">
                <div class="add-big-screen-card-text">
                  新增{{ type === 'bigScreenCatalog' ? '大屏' : '组件' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 后面遍历 list -->
        <div v-for="screen in list" :key="screen.id" class="big-screen-card-wrap" :style="{
          width: gridComputed ? 'auto' : '290px'
        }">
          <div class="big-screen-card-inner">
            <div class="screen-card__hover">
              <div class="screen-card__hover-box">
                <div class="preview">
                  <div class="screen-card__oper-label circle" @click="preview(screen)">
                    <span>访问</span>
                  </div>
                  <div class="circle" @click="design(screen)">
                    <span>设计</span>
                  </div>
                  <div class="circle" @click="edit(screen)">
                    <span>编辑</span>
                  </div>
                  <div class="circle" @click="copy(screen)">
                    <span>复制</span>
                  </div>
                  <div class="circle" @click="del(screen)">
                    <span>删除</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="big-screen-card-img">
              <el-image :src="getCoverPicture(screen.coverPicture)" fit="fill" style="width: 100%; height: 100%">
                <div slot="placeholder" class="image-slot">
                  加载中···
                </div>
                <div slot="error" class="image-slot" style="font-size: 20px">
                  <div class="error-img-text">
                    {{ screen.name }}
                  </div>
                </div>
              </el-image>
            </div>
            <div class="big-screen-bottom">
              <div class="left-bigscreen-title" :title="screen.name">
                {{ screen.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-pagination-wrap">
        <div class="bs-pagination">
          <el-pagination class="bs-el-pagination" popper-class="bs-el-pagination" background
            layout="total, prev, pager, next, sizes" :page-size="size" prev-text="上一页" next-text="下一页"
            :total="totalCount" :page-sizes="[10, 20, 50, 100]" :current-page="current"
            @current-change="currentChangeHandle" @size-change="sizeChangeHandle" />
        </div>
      </div>
    </div>

    <!-- 新增或编辑弹窗 -->
    <EditForm ref="EditForm" :type="pageType" @refreshData="reSearch" />
  </div>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
import { getFileUrl } from 'data-room-ui/js/utils/file'
import EditForm from './EditForm.vue'
export default {
  name: 'BigScreenList',
  mixins: [pageMixins],
  props: {
    type: {
      type: String,
      default: 'bigScreenCatalog'
    },
    catalogInfo: {
      type: Object,
      default: () => { }
    }
  },
  components: { EditForm },
  data() {
    return {
      templateLoading: false,
      searchKey: '',
      list: [],
      loading: false
    }
  },
  computed: {
    hint() {
      return this.pageType === 'bigScreen' ? '大屏' : '组件'
    },
    code() {
      return this.catalogInfo?.page?.code
    },
    gridComputed() {
      return this.list.length > 2
    },
    pageType() {
      return this.type === 'bigScreenCatalog' ? 'bigScreen' : 'component'
    }
  },
  watch: {
    code(value) {
      this.current = 1
      this.getDataList()
    }
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      this.$dataRoomAxios.get('/bigScreen/design/page', {
        parentCode: this.code || null,
        current: this.current,
        size: this.size,
        searchKey: this.searchKey,
        type: this.pageType
      })
        .then((data) => {
          this.list = data.list
          this.totalCount = data.totalCount
        })
        .finally(() => {
          this.loading = false
        })
    },
    preview(screen) {
      const { href } = this.$router.resolve({
        path: window.BS_CONFIG?.routers?.previewUrl || '/big-screen/preview', // 这里写的是要跳转的路由地址
        query: {
          code: screen.code
        }
      })
      window.open(href, '_blank')
    },
    design(screen) {
      const path = window.BS_CONFIG?.routers?.designUrl || '/big-screen/design'
      // const { href } = this.$router.resolve({
      //   path,
      //   query: {
      //     code: screen.code
      //   }
      // })
      // window.open(href, '_self')
      this.$router.push({
        path,
        query: {
          code: screen.code
        }
      })
    },
    add() {
      const page = {
        code: '',
        type: 'bigScreen'
      }
      this.$refs.EditForm.init(page, this.catalogInfo.page)
    },
    edit(screen) {
      this.$refs.EditForm.init(screen, this.catalogInfo.page)
    },
    del(screen) {
      this.$confirm(`确定删除该${this.hint}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          this.$dataRoomAxios.post(`/bigScreen/design/delete/${screen.code}`)
            .then(() => {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.getDataList()
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            })
        })
        .catch()
    },
    copy(screen) {
      this.$confirm(`确定复制该${this.hint}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          this.$dataRoomAxios.post(`/bigScreen/design/copy/${screen.code}`)
            .then(() => {
              this.$message({
                type: 'success',
                message: '复制成功'
              })
              this.getDataList()
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: '复制失败!'
              })
            })
        })
        .catch((e) => {
          console.error(e)
        })
    },
    /**
     * 获取封面图片,如果是相对路径则拼接上文件访问前缀地址
     * @param url
     * @returns {*}
     */
    getCoverPicture(url) {
      return getFileUrl(url)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/layout.scss';
</style>
