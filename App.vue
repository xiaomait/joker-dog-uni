<script>
export default {
  onLaunch: function () {
    console.log("App Launch")
  },
  onShow: function () {
    console.log("App Show")
  },
  onHide: function () {
    console.log("App Hide")
  }
}
</script>

<style lang="scss">
page {
  background:
    radial-gradient(circle at 12% 20%, #fff 0 18%, transparent 18%),
    radial-gradient(circle at 90% 10%, #dcdcdc 0 24%, transparent 24%),
    radial-gradient(circle at 80% 85%, #d7d7d7 0 22%, transparent 22%), #ececec;
}

button {
  margin: 0;
}
</style>
