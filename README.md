# Arazial App

A cross-platform Flutter application for land auctions with a modern UI/UX design. This app allows users to view auctions, check details, and place bids.

## Features

- **Browse Auctions**: View active, upcoming, and past land auctions
- **Auction Details**: See comprehensive information about land properties
- **Real-time Countdown**: Track the remaining time for active auctions
- **Bidding System**: Place bids on active auctions
- **Bid History**: View anonymous bid history for auctions
- **User Authentication**: Simple login/logout functionality

## Screenshots

(You would add screenshots here after building the app)

## Technical Overview

### Architecture

The app follows a provider-based architecture for state management:

- **Models**: Data structures for auctions and bids
- **Providers**: State management for auctions and authentication
- **Screens**: Main UI views (home screen, auction details)
- **Widgets**: Reusable UI components
- **Utils**: Helper functions and formatters

### Dependencies

- `provider`: State management
- `http`: API communication
- `intl`: Formatting for dates and currency
- `shared_preferences`: Local storage
- `flutter_countdown_timer`: Time display
- `cached_network_image`: Image caching
- `google_fonts`: Typography

## Getting Started

### Prerequisites

- Flutter SDK (latest version)
- Android Studio / XCode for building to respective platforms

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/land_auction_app.git
   ```

2. Navigate to the project directory
   ```
   cd land_auction_app
   ```

3. Install dependencies
   ```
   flutter pub get
   ```

4. Run the app
   ```
   flutter run
   ```

## Demo Credentials

For testing purposes, you can use the following credentials:
- Email: user@example.com
- Password: password

## Future Improvements

- Admin panel for managing auctions
- Push notifications for bid updates
- Map integration for property locations
- Payment system integration
- Favorites/saved auctions feature
- Filter and search functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The app uses sample images from Unsplash
- Icons from Flutter's material design library 