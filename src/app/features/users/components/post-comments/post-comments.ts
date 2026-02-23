import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-comments.html',
  styleUrl: './post-comments.scss',
})
export class PostComments {

  @Input() postId!: number;
  /* id del post ricevuto dal padre */

}
