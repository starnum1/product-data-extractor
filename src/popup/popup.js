import { UIController } from './controllers/UIController.js';
import { DataService } from './services/DataService.js';

document.addEventListener('DOMContentLoaded', () => {
  const dataService = new DataService();
  const uiController = new UIController(dataService);
  
  uiController.init();
});
