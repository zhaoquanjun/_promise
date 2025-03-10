const obj = {
  name: 'Alice',
  printName: function () {
    console.log(this)
    setTimeout(function () {
      this.name = 'Bob'
      console.log(this.name)
    }, 1000)
  }
}
obj.printName()
