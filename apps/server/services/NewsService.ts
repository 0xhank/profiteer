

export class NewsService {

  constructor(
  ) {

  }

  // Status endpoint
  getStatus(): { status: number } {
    return { status: 200 };
  }
  
}