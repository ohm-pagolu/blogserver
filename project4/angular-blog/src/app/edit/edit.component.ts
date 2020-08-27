import { Component, OnInit, Input } from '@angular/core';
import { Post,BlogService } from '../blog.service';
import { Router, ActivatedRoute } from '@angular/router';

function parseJWT(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  post: Post;

  constructor(private blogService:BlogService, private router : Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(() => {
      
      let draft = this.blogService.getCurrentDraft();
      let id = +this.activatedRoute.snapshot.paramMap.get('id');
      //console.log(id);
      
      if(draft == null || draft.postid != id){
        let username = parseJWT(document.cookie)["usr"];
        this.blogService.getPost(username,id).subscribe(p => {
          this.post = p;
        });  
      }
      else {
        this.post = draft;
      }

    });
    
  }

  savePost(): void {
    let username = parseJWT(document.cookie)["usr"];
    
    let savedPosts = this.blogService.getSavedPosts();

    this.post.modified = new Date(Date.now());

    if(savedPosts.find(element => element == this.post.postid) == null) {
      this.blogService.newPost(username,this.post).subscribe(()=>{
          savedPosts.push(this.post.postid);
          //console.log("NEW POST!!!!");
          this.blogService.runSaveCallback(this.post);
        });
    }
    else {
      this.blogService.updatePost(username,this.post).subscribe(()=>{
          //console.log("Update!!!");
          this.blogService.runSaveCallback(this.post);
        });
    }
    
  }

  previewPost(): void {
    this.blogService.setCurrentDraft(this.post);
    this.router.navigate(["/preview/"+this.post.postid]);
  }

  deletePost(): void {
    let username = parseJWT(document.cookie)["usr"];

    let savedPosts = this.blogService.getSavedPosts();

    if(savedPosts.find(element => element == this.post.postid) != null) {
      this.blogService.deletePost(username,this.post.postid).subscribe(()=>{
        savedPosts.splice(savedPosts.indexOf(this.post.postid), 1);
        //console.log("DELETE!!");
        this.blogService.runDeleteCallback(this.post.postid);
        this.router.navigate(["/"]);
      });
    } else {
      this.blogService.runDeleteCallback(this.post.postid);
      this.router.navigate(["/"]);
    }

  }

}
