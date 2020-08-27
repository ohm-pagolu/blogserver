import { Component, OnInit } from '@angular/core';
import { Parser, HtmlRenderer } from 'commonmark';
import { Post,BlogService } from '../blog.service';
import { Router, ActivatedRoute } from '@angular/router';

function parseJWT(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  post: Post;
  title: String;
  body: String;

  constructor(private blogService:BlogService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
  	this.activatedRoute.paramMap.subscribe(() => {
  	  let draft = this.blogService.getCurrentDraft();
      let id = +this.activatedRoute.snapshot.paramMap.get('id');
      //console.log(id);

      let reader = new Parser();
      let writer = new HtmlRenderer();
      
      if(draft == null || draft.postid != id) {
        let username = parseJWT(document.cookie)["usr"];
        this.blogService.getPost(username,id).subscribe(p => {
          this.post = p;

          let parsed = reader.parse(this.post.title);
          this.title = writer.render(parsed);
          parsed = reader.parse(this.post.body);
          this.body = writer.render(parsed);
        });  
      }
      else {
        this.post = draft;

        let parsed = reader.parse(this.post.title);
        this.title = writer.render(parsed);
        parsed = reader.parse(this.post.body);
        this.body = writer.render(parsed);
      }

  	});
  }

  editPost(): void {
  	this.blogService.setCurrentDraft(this.post);
    this.router.navigate(["/edit/"+this.post.postid]);
  }

}
