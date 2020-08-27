<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Preview Post</title>
</head>
<body>
        <div>
            <form action="post" method="POST">
                <input type="hidden" name="username" value="<%= request.getParameter("username")%>">
                <input type="hidden" name="postid" value="<%= request.getParameter("postid")%>">
                <input type="hidden" name="title" value="<%= (String)request.getAttribute("title")%>">
                <input type="hidden" name="body" value="<%= (String)request.getAttribute("body")%>">
                <button type="submit" name="action" value="open">Close Preview</button>
            </form>
        </div>
        <div>
            <h1 id="title"><%= request.getAttribute("titleHTML") %></h1>
            <div id="body"><%= request.getAttribute("bodyHTML") %></div>
        </div>
</html>
