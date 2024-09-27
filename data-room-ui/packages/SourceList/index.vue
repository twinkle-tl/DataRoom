<template>
  <div class="big-screen-list-wrap">
    <div class="internal-box">
      <div class="top-search-wrap">
        <el-input v-model="searchKey" class="bs-el-input" clearable placeholder="请输入图片名称" prefix-icon="el-icon-search"
          @clear="reSearch" @keyup.enter.native="reSearch" />
        <el-select v-model="extend" class="bs-el-select mr20" clearable placeholder="请选择图片格式" popper-class="bs-el-select"
          @change="reSearch">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button style="margin-right: 10px" type="primary" @click="reSearch">
          搜索
        </el-button>
        <el-upload :action="upLoadUrl" :before-upload="beforeUpload" :data="{ module: code }" :file-list="fileList"
          :headers="headers" :on-error="uploadError" :on-success="uploadSuccess" :show-file-list="false"
          class="upload-demo" multiple>
          <el-button type="primary">
            上传资源
          </el-button>
        </el-upload>
      </div>
      <div v-if="list.length !== 0" v-loading="loading" :style="{
        display: gridComputed ? 'grid' : 'flex',
        justifyContent: gridComputed ? 'space-around' : 'flex-start'
      }" class="list-wrap bs-scrollbar" element-loading-text="加载中">
        <!-- <div v-if="list.length !== 0"> -->
        <div v-for="screen in list" :key="screen.id" :style="{
          width: gridComputed ? 'auto' : '290px'
        }" class="big-screen-card-wrap">
          <div class="big-screen-card-inner">
            <div class="screen-card__hover">
              <div class="screen-card__hover-box">
                <div class="preview">
                  <div class="screen-card__oper-label circle" @click="preview(screen)">
                    <span>预览</span>
                  </div>
                  <div class="circle" @click="downLoad(screen)">
                    <span>下载</span>
                  </div>
                  <div class="circle" @click="del(screen)">
                    <span>删除</span>
                  </div>
                  <div class="circle" @click="copy(screen)">
                    <span>链接</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="imgExtends.includes(screen.extension)" class="big-screen-card-img">
              <el-image :src="getCoverPicture(screen.url)" fit="contain" style="width: 100%; height: 100%">
                <div slot="placeholder" class="image-slot">
                  加载中···
                </div>
              </el-image>
            </div>
            <div v-else class="big-screen-card-img">
              <el-image :src="getUrl(screen)" fit="contain" style="width: 100%; height: 100%">
                <div slot="placeholder" class="image-slot">
                  加载中···
                </div>
              </el-image>
            </div>
            <div class="big-screen-bottom">
              <div :title="screen.originalName" class="left-bigscreen-title">
                {{ screen.originalName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        暂无数据
      </div>

      <div class="footer-pagination-wrap">
        <!-- <div class="footer-pagination-wrap-text">
        总共 {{ totalCount }} 个项目
      </div> -->
        <div class="bs-pagination">
          <el-pagination :current-page="current" :page-size="size" :page-sizes="[10, 20, 50, 100]" :total="totalCount"
            background class="bs-el-pagination" layout="total, prev, pager, next, sizes" next-text="下一页"
            popper-class="bs-el-pagination" prev-text="上一页" @current-change="currentChangeHandle"
            @size-change="sizeChangeHandle" />
        </div>
      </div>
    </div>

    <!-- 新增或编辑弹窗 -->
    <EditForm ref="EditForm" @refreshData="reSearch" />
  </div>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
import EditForm from './EditForm.vue'
import { getFileUrl } from 'data-room-ui/js/utils/file'

export default {
  name: 'BigScreenList',
  mixins: [pageMixins],
  props: {
    type: {
      type: String,
      default: 'bigScreen' // bigScreen | template
    },
    catalogInfo: {
      type: Object,
      default: () => {
      }
    }
  },
  components: { EditForm },
  data() {
    return {
      upLoadUrl: window.BS_CONFIG?.httpConfigs?.baseURL + '/bigScreen/file/upload',
      searchKey: '',
      extend: '',
      sourceExtends: window.BS_CONFIG?.sourceExtends || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'xls', 'xlsx', 'csv'],
      options: [],
      list: [],
      fileUploadParam: {},
      headers: {
        ...window.BS_CONFIG?.httpConfigs?.headers
      },
      fileList: [],
      loading: false,
      imgExtends: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'],
      otherExtends: {
        video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'f4v', 'rmvb', 'rm', '3gp', 'dat', 'ts', 'mts', 'vob'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'ape', 'm4a', 'm4r', 'amr', 'ac3'],
        excel: ['xls', 'xlsx', 'csv'],
        word: ['doc', 'docx'],
        ppt: ['ppt', 'pptx'],
        pdf: ['pdf']
      }
    }
  },
  computed: {
    code() {
      return this.catalogInfo?.page?.code
    },
    gridComputed() {
      return this.list.length > 3
    }
  },
  watch: {
    code(value) {
      this.current = 1
      this.getDataList()
    }
  },
  mounted() {
    this.getOptions()
    this.getDataList()
  },
  methods: {
    getUrl(file) {
      let extension = file.extension
      if (this.otherExtends.video.includes(extension)) {
        return require('./images/video.svg')
      }
      if (this.otherExtends.audio.includes(extension)) {
        return require('./images/audio.svg')
      }
      if (this.otherExtends.excel.includes(extension)) {
        return require('./images/excel.svg')
      }
      if (this.otherExtends.word.includes(extension)) {
        return require('./images/word.svg')
      }
      if (this.otherExtends.ppt.includes(extension)) {
        return require('./images/ppt.svg')
      }
      if (this.otherExtends.pdf.includes(extension)) {
        return require('./images/pdf.svg')
      }
      return require('./images/unknown.svg')
    },
    uploadError() {
      this.$message({
        type: 'error',
        message: '上传失败'
      })
    },
    beforeUpload(file) {
      // 获取文件后缀
      const extension = file.name.split('.').pop()
      // 判断文件类型是否符合要求
      const isValidFileType = this.sourceExtends.includes(extension)
      if (!isValidFileType) {
        this.$message.error('不支持的文件类型：' + extension)
      }
      return isValidFileType
    },
    uploadSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message({
          type: 'success',
          message: '上传成功'
        })
        this.getDataList()
      } else {
        this.$message({
          type: 'error',
          message: response.msg
        })
      }
    },
    getOptions() {
      this.options = []
      this.options.push({ label: '全部', value: '' })
      this.sourceExtends.forEach((ext) => this.options.push({ label: ext, value: ext }))
    },
    getDataList() {
      this.loading = true
      this.$dataRoomAxios.get('/bigScreen/file', {
        module: this.catalogInfo.page.code,
        current: this.current,
        size: this.size,
        extension: this.extend,
        searchKey: this.searchKey
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
      window.open(getFileUrl(screen.url), '_blank')
    },
    downLoad(screen) {
      this.$dataRoomAxios.download(`/bigScreen/file/download/${screen.id}`)
    },
    del(screen) {
      this.$confirm('确定删除该资源？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          this.$dataRoomAxios.post(`/bigScreen/file/delete/${screen.id}`)
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
      this.$message.success('复制成功')
      const transfer = document.createElement('input')
      document.body.appendChild(transfer)
      transfer.value = getFileUrl(screen.url) // 这里表示想要复制的内容
      transfer.focus()
      transfer.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      transfer.blur()
      transfer.style.display = 'none'
    },
    /**
     * 获取封面图片,如果是相对路径则拼接上文件访问前缀地址
     * @param url
     * @returns {*}
     */
    getCoverPicture(url) {
      return getFileUrl(url)
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/layout.scss';

.empty {
  width: 100%;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
