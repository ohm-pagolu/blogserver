<%@ page import ="java.util.ArrayList"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        table, td, th {  
          border: 1px solid #ddd;
          text-align: center;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
        }
        
        th, td {
          padding: 10px;
          font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          font-size: large;
          overflow: auto;
        }

        tr:nth-child(even) {background-color: #f2f2f2;}

        th {
            background-color: rgb(24, 104, 224);
            color: white;
        }

        button {
            background-color: rgb(135, 76, 175); 
            border: none;
            color: white;
            padding: 10px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
        }

        .button2 {background-color: rgb(18, 197, 33);} 
        .button3 {background-color: #f44336;} 
    </style>
    <title>Post List</title>
</head>
<body>
    <div>
        <form action="post" id="0">
            <input type="hidden" name="username" value="<%= request.getParameter("username")%>">
            <input type="hidden" name="postid" value="0">
            <button type="submit" name="action" value="open">New Post</button>
        </form>
        <br>
    </div>
    <table>
        <tr><th>Title</th><th>Created</th><th>Modified</th><th>&nbsp;</th></tr>

        <% 
            ArrayList<String> titleArray = (ArrayList<String>)request.getAttribute("titleArray");
            ArrayList<String> modifiedArray = (ArrayList<String>)request.getAttribute("modifiedArray");
            ArrayList<String> createdArray = (ArrayList<String>)request.getAttribute("createdArray");
            ArrayList<Integer> postidArray = (ArrayList<Integer>)request.getAttribute("postidArray");;
            for (int i = 0; i < titleArray.size(); i++) { %>
            <tr>
                <form id="1" action="post" method="POST"> 
                    <input type="hidden" name="username" value="<%= request.getParameter("username")%>">
                    <input type="hidden" name="postid" value="<%= postidArray.get(i) %>">
                    <td><%= titleArray.get(i) %></td>
                    <td><%= createdArray.get(i) %></td>
                    <td><%= modifiedArray.get(i) %></td>
                    <td>
                        <button class="button2" type="submit" name="action" value="open">Open</button>
                        <button class="button3" type="submit" name="action" value="delete">Delete</button>
                    </td>
                </form>
            </tr>
        <% } %>
    </table>
</html>
