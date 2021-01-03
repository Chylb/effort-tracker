export const logout = () => {
   localStorage.removeItem("username");
   localStorage.removeItem("avatar");

   document.cookie.split(";").forEach((c) => {
      document.cookie = c
         .replace(/^ +/, "")
         .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   window.location.href = "/login";
};

export const fetchApi = async (url) => {
   try {
      const response = await fetch(url, {
         mode: 'cors',
         credentials: 'include',
         headers: {
            'Accept': 'application/json',
         },
      })

      if (!response.ok) {
         return logout();
      }

      return response.json();
   }
   catch (err) {
      return logout();
   }
}

export const secondsToString = (seconds) => {
   const h = Math.floor(seconds / 3600);
   const m = Math.floor((seconds - 3600 * h) / 60);
   const s = Math.ceil(seconds - 3600 * h - 60 * m);

   if (seconds < 60) {
      if (s > 0)
         return s + "s";
      return "";
   }

   let res = s;
   if (s < 10)
      res = "0" + res;

   res = m + ":" + res;

   if (h > 0) {
      if (m < 10)
         res = "0" + res;

      res = h + ":" + res;
   }
   return res;
}
