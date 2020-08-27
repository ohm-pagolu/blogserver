<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%><%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Edit Post</title>
    <style>
        #header {
            background-color: aquamarine;
            width: 100%;
            margin: 0px;
            padding: 0px;
            border: 0px;
            font-size: 35pt;
            height: 60px;
        }
        button {
            padding: 10px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 10px;
        }

        input[type=text] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
        }

        label {
            font-size: 20pt;
        }

        textarea {
            width: 100%;
            padding: 12px 20px;
            box-sizing: border-box;
            border: 2px solid #ccc;
            border-radius: 4px;
            background-color: #f8f8f8;
            font-size: 16px;
            resize: none;
        }

    </style>
</head>
<body>
    <div id="header">Edit Post</div>
    <form action="post" method="POST">
        <div>
            <button type="submit" name="action" value="save">Save</button>
            <button type="submit" name="action" value="list">Close</button>
            <button type="submit" name="action" value="preview">Preview</button>
            <button type="submit" name="action" value="delete">Delete</button>
        </div>
        <input type="hidden" name="username" value="<%= request.getParameter("username") %>">
        <input type="hidden" name="postid" value="<%= request.getParameter("postid") %>">
        <div>
            <label for="title">Title</label>
            <input type="text" id="title" name="title" value="<%= (String)request.getAttribute("title") %>">
        </div>
        <div>
            <label for="body">Body</label>
            <textarea style="height: 20rem;" id="body" name="body"><%= (String)request.getAttribute("body") %></textarea>
        </div>
    </form>
</body>
</html>
