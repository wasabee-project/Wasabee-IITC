// fix for ES compatibility
export default function polyfill() {
  // create Promise.allSettled if missing
  if (!Promise.allSettled) {
    Promise.allSettled = function (promises) {
      let mappedPromises = promises.map((p) => {
        return p
          .then((value) => {
            return {
              status: "fulfilled",
              value,
            };
          })
          .catch((reason) => {
            return {
              status: "rejected",
              reason,
            };
          });
      });
      return Promise.all(mappedPromises);
    };
  }
}
