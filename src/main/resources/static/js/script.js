$.getJSON("/api/athlete", function (data) {
    $("#avatar").attr("src", data.profilePicture);
    $("#profileName").text(data.name);
})

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (settings.type == 'POST' || settings.type == 'PUT'
            || settings.type == 'DELETE') {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/
                .test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-XSRF-TOKEN",
                    Cookies.get('XSRF-TOKEN'));
            }
        }
    }
});

function logout() {
    $.post("/logout", function () {
        window.location.href = "/login";
    })
}

function secondsToString(seconds) {
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