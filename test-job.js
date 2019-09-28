;(async () => {
  const { job, start, stop } = require("microjob")

  try {
    // start the worker pool
    await start()

    // this function will be executed in another thread
    const res = await job(() => {
      let i = 0
      for (i = 0; i < 1000000; i++) {
        // heavy CPU load ...
      }

      return i
    })

    console.log(res) // 1000000
  } catch (err) {
    console.error(err)
  } finally {
    // shutdown worker pool
    await stop()
  }
})()

// Clutter

// 5x5
// $129 per month
// 33 Makespace bins

// 5x10
// $149 per months
// delivered for free
// free 1 hour per 30 days
// can get specific items back at once
// photo inventory online
// initially, items need to be in storage for 4-6 weeks
// can pick specific (any combo of specific bins, large items, specific bag from bin)
// LET THEM KNOW TWO DAYS IN ADVANCE IF I WANT TO CANCEL (BY 25TH)

// 5x15
// $189 per months
