import java.io.IOException;
import java.sql.* ;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.commonmark.node.*;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

/**
 * Servlet implementation class for Servlet: ConfigurationTest
 *
 */
public class Editor extends HttpServlet {
    /**
     * The Servlet constructor
     * 
     * @see javax.servlet.http.HttpServlet#HttpServlet()
     */
    public Editor() {}

    public void init() throws ServletException
    {
        /*  write any servlet initialization code here or remove this function */
    }
    
    public void destroy()
    {
        /*  write any servlet cleanup code here or remove this function */
    }

    /**
     * Handles HTTP GET requests
     * 
     * @see javax.servlet.http.HttpServlet#doGet(HttpServletRequest request,
     *      HttpServletResponse response)
     */
    public void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException 
    {
	// implement your GET method handling code here
	// currently we simply show the page generated by "edit.jsp"
        if(sanityChecks(request, response, "get") == false) return;
        serveRequest(request, response, null);
    }
    
    /**
     * Handles HTTP POST requests
     * 
     * @see javax.servlet.http.HttpServlet#doPost(HttpServletRequest request,
     *      HttpServletResponse response)
     */
    public void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException 
    {
	// implement your POST method handling code here
	// currently we simply show the page generated by "edit.jsp"
        if(sanityChecks(request, response, "post") == false) return;
        serveRequest(request, response, null);

    }

    private void serveRequest(HttpServletRequest request, HttpServletResponse response, String newAction) 
    	throws ServletException, IOException
    {
    	String action = request.getParameter("action");
        String username = request.getParameter("username");
        String postid = request.getParameter("postid");
        String title = request.getParameter("title");
        String body = request.getParameter("body");

        Parser parser = Parser.builder().build();
        HtmlRenderer renderer = HtmlRenderer.builder().build();

        if(newAction != null) {
        	action = newAction;
        }

        int pid = 0;
        if(postid != null) {
            pid = Integer.parseInt(postid);
        }

        try {
            Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException ex) {
            System.out.println(ex);
            return;
        }

        Connection con = null;
        PreparedStatement ps = null;
        PreparedStatement ps2 = null;
        ResultSet rs = null;

        try {

            con = DriverManager.getConnection("jdbc:mysql://localhost:3306/CS144", "cs144", "");

            if(action.equals("open")) {
                if(pid <= 0 || (title != null && body != null)) {
                    if(title == null) {
                        request.setAttribute("title", "");
                    } else {
                        request.setAttribute("title", title.replaceAll("\"", "&quot;"));
                    }

                    if(body == null) {
                        request.setAttribute("body", "");
                    } else {
                        request.setAttribute("body", body);
                    }

                    request.getRequestDispatcher("/edit.jsp").forward(request, response);

                } else {
                    ps = con.prepareStatement("SELECT title, body FROM Posts WHERE username = ? AND postid = ?");
                    ps.setString(1, username);
                    ps.setInt(2, pid);

                    rs = ps.executeQuery();
                    boolean exist = rs.next();

                    if(!exist) {
                        response.sendError(404, "Not Found");
                    } else {
                        request.setAttribute("title", rs.getString("title").replaceAll("\"", "&quot;"));
                        request.setAttribute("body", rs.getString("body"));

                        request.getRequestDispatcher("/edit.jsp").forward(request, response);
                    }
                }
            } else if(action.equals("save")) {
            	if(pid <= 0) {
            		ps2 = con.prepareStatement("SELECT MAX(postid) AS mPid FROM Posts WHERE username = ?");
            		ps2.setString(1, username);

            		rs = ps2.executeQuery();
            		if(rs.next()) {
            			pid = rs.getInt("mPid") + 1;
            		} else {
            			pid = 1;
            		}

            		ps = con.prepareStatement("INSERT INTO Posts VALUES (?, ?, ?, ?, ?, ?)");
            		ps.setString(1, username);
            		ps.setInt(2, pid);
            		ps.setString(3, title);
            		ps.setString(4, body);
            		Timestamp timestamp = new Timestamp(new Date().getTime());
            		ps.setTimestamp(5, timestamp);
            		ps.setTimestamp(6, timestamp);

            		ps.executeUpdate();
            	} else {
            		ps = con.prepareStatement("UPDATE Posts SET title = ?, body = ?, modified = ? WHERE username = ? AND postid = ?");
            		ps.setString(1, title);
            		ps.setString(2, body);
            		Timestamp timestamp = new Timestamp(new Date().getTime());
            		ps.setTimestamp(3, timestamp);
            		ps.setString(4, username);
            		ps.setInt(5, pid);

            		ps.executeUpdate();
            	}

            	serveRequest(request, response, "list");
            } else if(action.equals("delete")) {
            	ps = con.prepareStatement("DELETE FROM Posts WHERE username = ? AND postid = ?");
            	ps.setString(1, username);
            	ps.setInt(2, pid);

            	ps.executeUpdate();

            	serveRequest(request, response, "list");
            } else if(action.equals("list")) {
                ps = con.prepareStatement("SELECT title, modified, created, postid from Posts WHERE username=?");
                ps.setString(1, username);
                
                rs = ps.executeQuery();
                ArrayList<String> titleArray = new ArrayList<String>();
                ArrayList<String> modifiedArray = new ArrayList<String>();
                ArrayList<String> createdArray = new ArrayList<String>();
                ArrayList<Integer> postidArray = new ArrayList<Integer>();

                while(rs.next()){
                    titleArray.add(renderer.render(parser.parse(rs.getString("title"))));
                    modifiedArray.add(rs.getTimestamp("modified").toString());
                    createdArray.add(rs.getTimestamp("created").toString());
                    postidArray.add(Integer.valueOf(rs.getInt("postid")));
                }
    
            	request.setAttribute("titleArray",titleArray);
            	request.setAttribute("modifiedArray",modifiedArray);
            	request.setAttribute("createdArray",createdArray);
            	request.setAttribute("postidArray",postidArray);
            	request.getRequestDispatcher("/list.jsp").forward(request,response);
            } else if(action.equals("preview")){
                String titleHTML = renderer.render(parser.parse(title));
                String bodyHTML = renderer.render(parser.parse(body));
                
                request.setAttribute("title", title.replaceAll("\"", "&quot;"));
                request.setAttribute("body", body.replaceAll("\"", "&quot;"));

                request.setAttribute("titleHTML",titleHTML);
                request.setAttribute("bodyHTML",bodyHTML);
                request.getRequestDispatcher("/preview.jsp").forward(request,response);
            } else {
            	response.sendError(404, "Not Found");
            }

        } catch (SQLException ex){
            System.out.println("SQLException caught");
            System.out.println("---");
            while ( ex != null ) {
                System.out.println("Message   : " + ex.getMessage());
                System.out.println("SQLState  : " + ex.getSQLState());
                System.out.println("ErrorCode : " + ex.getErrorCode());
                System.out.println("---");
                ex = ex.getNextException();
            }
            response.sendError(404, "Not Found");
        } finally {
            try { rs.close(); } catch (Exception e) { /* ignored */ }
            try { ps.close(); } catch (Exception e) { /* ignored */ }
        	try { ps2.close(); } catch (Exception e) { /* ignored */ }
            try { con.close(); } catch (Exception e) { /* ignored */ }
        }
    }

    private boolean sanityChecks(HttpServletRequest request, HttpServletResponse response, String methodType)
        throws IOException
    {

    	String action = request.getParameter("action");
        String username = request.getParameter("username");
        String postid = request.getParameter("postid");
        String title = request.getParameter("title");
        String body = request.getParameter("body");

    	if(action == null) {
        	response.sendError(400, "Bad Request");
        	return false;
        }

        if(methodType.equals("get") && (action.equals("save") || action.equals("delete"))) {
            response.sendError(405, "Method not allowed");
            return false;
        }

        if(action.equals("open") && (username == null || postid == null)) {
        	response.sendError(400, "Bad Request");
        	return false;
        }

        if(action.equals("save") && (username == null || postid == null || title == null || body == null)) {
        	response.sendError(400, "Bad Request");
        	return false;
        }

        if(action.equals("delete") && (username == null || postid == null)) {
        	response.sendError(400, "Bad Request");
        	return false;
        }

        if(action.equals("preview") && (username == null || postid == null || title == null || body == null)) {
        	response.sendError(400, "Bad Request");
        	return false;
        }

        if(action.equals("list") && username == null) {
            response.sendError(400, "Bad Request");
            return false;
        }

        if(postid != null) {
            try {
                int pid = Integer.parseInt(postid);
            } catch (NumberFormatException e) {
                response.sendError(400, "Bad Request");
                return false;
            }
        }

        return true;
    }

}

