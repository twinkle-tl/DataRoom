<template>
  <div class="big-screen-list-wrap">
    <div class="internal-box">
      <div class="top-search-wrap">
        <el-select
          v-if="catalogInfo !== 'system'"
          v-model="catalogCode"
          class="bs-el-select mr20"
          popper-class="bs-el-select"
          placeholder="请选择分组"
          filterable
          clearable
          @change="reSearch"
        >
          <el-option
            v-for="item in catalogList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
        <el-input
          v-model="searchKey"
          class="bs-el-input"
          placeholder="请输入组件名称"
          prefix-icon="el-icon-search"
          clearable
          @clear="reSearch"
          @keyup.enter.native="reSearch"
        />
        <el-button
          type="primary"
          @click="reSearch"
        >
          搜索
        </el-button>
        <el-button
          v-if="catalogInfo !== 'system'"
          type="primary"
          @click="catalogManage"
        >
          分组管理
        </el-button>
      </div>
      <div
        v-loading="loading"
        class="list-wrap bs-scrollbar"
        element-loading-text="加载中"
        :style="{
          display: gridComputed ? 'grid' : 'flex',
          justifyContent: gridComputed ? 'space-around' : 'flex-start'
        }"
      >
        <!-- 第一个是新增大屏卡片 -->
        <div
          v-if="catalogInfo !== 'system'"
          class="big-screen-card-wrap"
          :style="{
            width: gridComputed ? 'auto' : '290px'
          }"
          @click="add"
        >
          <div class="big-screen-card-inner big-screen-card-inner-add">
            <div class="add-big-screen-card">
              <div class="add-big-screen-card-inner">
                <div class="add-big-screen-card-text">
                  新增组件
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 后面遍历 list -->
        <div
          v-for="screen in list"
          :key="screen.id"
          class="big-screen-card-wrap"
          :style="{
            width: gridComputed ? 'auto' : '290px'
          }"
        >
          <div class="big-screen-card-inner">
            <div class="screen-card__hover">
              <div class="screen-card__hover-box">
                <div class="preview">
                  <div
                    class="screen-card__oper-label circle"
                    @click="preview(screen)"
                  >
                    <span>预览</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="design(screen)"
                  >
                    <span>设计</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="edit(screen)"
                  >
                    <span>编辑</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="copy(screen)"
                  >
                    <span>复制</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="del(screen)"
                  >
                    <span>删除</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="big-screen-card-img">
              <el-image
                :src="catalogInfo !== 'system' ? getCoverPicture(screen.coverPicture) : screen.img"
                fit="fill"
                style="width: 100%; height: 100%"
              >
                <div
                  slot="placeholder"
                  class="image-slot"
                >
                  加载中···
                </div>
                <div
                  slot="error"
                  class="image-slot"
                  style="font-size: 20px"
                >
                  <div class="error-img-text">
                    {{ catalogInfo !== 'system' ? screen.name : screen.title }}
                  </div>
                </div>
              </el-image>
            </div>
            <div class="big-screen-bottom">
              <div
                class="left-bigscreen-title"
                :title="catalogInfo !== 'system' ? screen.name : screen.title"
              >
                {{ catalogInfo !== 'system' ? screen.name : screen.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="catalogInfo !== 'system'"
        class="footer-pagination-wrap"
      >
        <!-- <div class="footer-pagination-wrap-text">
        总共 {{ totalCount }} 个项目
      </div> -->
        <div class="bs-pagination">
          <el-pagination
            class="bs-el-pagination"
            popper-class="bs-el-pagination"
            background
            layout="total, prev, pager, next, sizes"
            :page-size="size"
            prev-text="上一页"
            next-text="下一页"
            :total="totalCount"
            :page-sizes="[10, 20, 50, 100]"
            :current-page="current"
            @current-change="currentChangeHandle"
            @size-change="sizeChangeHandle"
          />
        </div>
      </div>
    </div>
    <!-- 新增或编辑弹窗 -->
    <EditForm
      v-if="catalogInfo !== 'system'"
      ref="EditForm"
      :type="catalogInfo"
      @refreshData="reSearch"
    />
    <CatalogEditForm
      v-if="catalogInfo !== 'system'"
      ref="CatalogEditForm"
      :catalog-type="catalogType"
      @updateCatalogList="updateCatalogList"
    />
  </div>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
import { getFileUrl } from 'data-room-ui/js/utils/file'
import EditForm from './EditForm.vue'
import CatalogEditForm from './CatalogEditForm'
import innerRemoteComponents, { getRemoteComponents } from 'data-room-ui/RemoteComponents/remoteComponentsList'
export default {
  name: 'BigScreenList',
  mixins: [pageMixins],
  props: {
    catalogInfo: {
      type: String,
      default: ''
    }
  },
  components: { EditForm, CatalogEditForm },
  data () {
    return {
      name: '',
      catalogVisible: false,
      templateLoading: false,
      searchKey: '',
      list: [],
      loading: false,
      catalogList: [], // 分组列表
      catalogCode: ''
    }
  },
  computed: {
    catalogType () {
      if (this.catalogInfo === 'component') {
        return 'componentCatalog'
      } else {
        return 'bizComponentCatalog'
      }
    },
    code () {
      return ''
    },
    gridComputed () {
      return this.list.length > 2
    }
  },
  watch: {
    catalogInfo () {
      this.reset()
      this.init()
    },
    catalogCode (value) {
      this.reSearch()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    reset () {
      this.searchKey = ''
      this.current = 1
      this.size = 10
      this.catalogCode = ''
      this.init()
    },
    init () {
      if (this.catalogInfo !== 'system') {
        this.getDataList()
        this.getCatalogList()
      } else {
        this.list = []
        this.list = [...innerRemoteComponents, ...getRemoteComponents()]
      }
    },
    updateCatalogList (list) {
      this.catalogList = list
    },
    reSearch () {
      if (this.catalogInfo !== 'system') {
        this.current = 1
        this.getDataList()
      } else {
        const arr = [...innerRemoteComponents, ...getRemoteComponents()]
        this.list = arr?.filter((item) => item.title.indexOf(this.searchKey) !== -1)
      }
    },
    catalogManage () {
      this.$refs.CatalogEditForm.formVisible = true
    },
    // 获取分组列表
    getCatalogList () {
      this.$dataRoomAxios.get(`/bigScreen/type/list/${this.catalogType}`)
        .then((data) => {
          this.catalogList = data
        })
        .catch(() => { })
    },
    getDataList () {
      this.loading = true
      if (this.catalogInfo === 'component') {
        this.$dataRoomAxios.get('/bigScreen/design/page', {
          parentCode: this.catalogCode || null,
          current: this.current,
          size: this.size,
          searchKey: this.searchKey,
          type: 'component'
        })
          .then((data) => {
            this.list = data.list
            this.totalCount = data.totalCount
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        this.$dataRoomAxios.get('/bigScreen/bizComponent/page', {
          current: this.current,
          size: this.size,
          // searchKey: this.searchKey,
          name: this.searchKey,
          type: this.catalogCode || null
        })
          .then((data) => {
            this.list = data.list
            this.totalCount = data.totalCount
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    preview (screen) {
      let path = ''
      let query = {
        code: screen.code
      }
      if (this.catalogInfo === 'component') {
        path = (window.BS_CONFIG?.routers?.previewUrl || '/big-screen/preview')
      } else {
        path = (window.BS_CONFIG?.routers?.bizComponentPreviewUrl || 'big-screen-biz-component-preview')
      }
      if (this.catalogInfo === 'system') {
        query = {
          dirName: screen.customize.vueSysComponentDirName
        }
      }
      const { href } = this.$router.resolve({
        path, // 这里写的是要跳转的路由地址
        query
      })
      window.open(href, '_blank')
    },
    design (screen) {
      const path = this.catalogInfo === 'component' ? (window.BS_CONFIG?.routers?.designUrl || '/big-screen/design') : (window.BS_CONFIG?.routers?.bizComponentDesignUrl || 'big-screen-biz-component-design')
      // const { href } = this.$router.resolve({
      //   path,
      //   query: {
      //     code: screen.code
      //   }
      // })
      // 新窗口打开
      // window.open(href, '_self')
      this.$router.push({
        path,
        query: {
          code: screen.code
        }
      })
    },
    add () {
      const page = {
        code: '',
        type: this.catalogInfo === 'component' ? 'bigScreen' : 'bizComponent'
      }
      this.$refs.EditForm.init(page, this.catalogCode)
    },
    edit (screen) {
      this.$refs.EditForm.init(screen, this.catalogCode)
    },
    del (screen) {
      this.$confirm('确定删除该组件', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          const url = this.catalogInfo === 'component' ? `/bigScreen/design/delete/${screen.code}` : `/bigScreen/bizComponent/delete/${screen.id}`
          this.$dataRoomAxios.post(url)
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
    copy (screen) {
      const url = this.catalogInfo === 'component' ? `/bigScreen/design/copy/${screen.code}` : `/bigScreen/bizComponent/copy/${screen.code}`
      this.$confirm('确定复制该组件', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          this.$dataRoomAxios.post(url)
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
    getCoverPicture (url) {
      return getFileUrl(url)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/layout.scss';
</style>
