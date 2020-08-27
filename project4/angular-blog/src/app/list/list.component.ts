import { Component, OnInit } from '@angular/core';
import { Post,BlogService } from '../blog.service';
import { Observable } from 'rxjs';
import { max } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


function parseJWT(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  posts: Post[];

  constructor(private blogService:BlogService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts(): void {
    let username = parseJWT(document.cookie)["usr"];
    this.blogService.fetchPosts(username).subscribe(posts => {
      this.posts = posts;

      let savedPosts:number[] = [];
      for(let i = 0; i < this.posts.length; i++) {
        savedPosts.push(this.posts[i].postid);
      }
      this.blogService.setSavedPosts(savedPosts);

      this.blogService.saveSubscribe((new_post) => {
        this.posts[this.posts.indexOf(this.posts.find(post => post.postid == new_post.postid))] = new_post;
      });

      this.blogService.deleteSubscribe((postid) => {
        this.posts.splice(this.posts.indexOf(this.posts.find(post => post.postid == postid)), 1);
      });

    });
  }

  onSelect(post: Post): void {
    this.blogService.setCurrentDraft(post);
    this.router.navigate(["/edit/"+post.postid]);
  }

  createNewPost(): void {
    let post = new Post;
    post.body = "";
    post.title = "";
    let t = new Date(Date.now());
    post.created = t;
    post.modified = t; 
    let max_id = 0;
    if(this.posts.length == 0) {
      post.postid = 1;
    }
    else {
      for(let i = 0; i < this.posts.length; i++) {
        if(this.posts[i].postid > max_id)
          max_id = this.posts[i].postid;
      }
      post.postid = max_id+1;
    }
    //console.log(JSON.stringify(post));
    this.posts.push(post);
    this.blogService.setCurrentDraft(post);
    this.router.navigate(["/edit/"+post.postid]);
  }

}
