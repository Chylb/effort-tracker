export const logout = (): void => {
   localStorage.removeItem("username");
   localStorage.removeItem("avatar");

   document.cookie.split(";").forEach((c) => {
      document.cookie = c
         .replace(/^ +/, "")
         .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   window.location.href = "/login";
};