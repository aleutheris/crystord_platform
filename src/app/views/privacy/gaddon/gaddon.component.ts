import { Component } from '@angular/core';

@Component({
  selector: 'app-gaddon',
  standalone: true,
  template: `
    <div class="gaddon-container">
      <div class="content">
        <h1>Gaddon</h1>
        <p>This is a simple page with white background and text content.</p>
        <p>You can add your custom content here.</p>
      </div>
    </div>
  `,
  styles: [`
    .gaddon-container {
      background-color: white;
      min-height: 100vh;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .content {
      max-width: 800px;
      width: 100%;
      padding: 40px 20px;
      text-align: center;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
      font-size: 2.5rem;
    }

    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
      font-size: 1.1rem;
    }
  `]
})
export class GaddonComponent {
  constructor() { }
}
