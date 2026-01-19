# OpenFGA Dashboard

[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A modern, pure frontend dashboard for managing OpenFGA authorization servers. Connect to your OpenFGA instance and manage stores, authorization models, relationship tuples, and run queries - all from your browser.

## Features

- **Store Management**: Create, view, and delete OpenFGA stores
- **Authorization Model Editor**: Create and view authorization models with Monaco Editor
- **Relationship Tuples**: Add, search, and delete relationship tuples
- **Query Operations**:
  - **Check**: Test if a user has a specific relation with an object
  - **Expand**: View the relationship tree
  - **List Objects**: Find all objects a user has access to
  - **List Users**: Find all users with access to an object
- **Multiple Authentication Methods**:
  - No authentication
  - API Key (Pre-shared Key)
  - OIDC (Client Credentials)

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + custom components inspired by [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- An OpenFGA server instance (local or remote)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dz1922/openfga-dashboard.git
   cd openfga-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Connecting to OpenFGA

1. Enter your OpenFGA server URL (e.g., `http://localhost:8080`)
2. Select your authentication method:
   - **None**: For local development without authentication
   - **API Key**: Enter your pre-shared key
   - **OIDC**: Enter client credentials (Client ID, Client Secret, Token URL)
3. Click "Test Connection" to verify
4. Click "Connect" to access the dashboard

## Security Considerations

- **Client-side only**: This is a pure frontend application. All connections are made directly from your browser to your OpenFGA server.
- **Local storage**: Connection credentials are stored in your browser's local storage.
- **CORS**: Your OpenFGA server must have CORS enabled for this application's domain.
- **Recommendations**:
  - Only connect to servers you own or have explicit permission to access
  - Do not use this tool on shared or public computers
  - Clear your browser data after use on non-personal devices

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dz1922/openfga-dashboard)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard pages
│   └── page.tsx            # Landing/Connection page
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── connection/         # Connection-related components
│   ├── stores/             # Store management components
│   ├── model/              # Authorization model components
│   ├── tuples/             # Tuple management components
│   ├── query/              # Query operation components
│   └── layout/             # Layout components
├── lib/
│   ├── openfga/            # OpenFGA API client
│   └── store/              # Zustand stores
└── hooks/                  # Custom React hooks
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you find this project useful, consider:

- Giving it a star on GitHub
- [Buying me a coffee](https://buymeacoffee.com)

## Acknowledgments

- [OpenFGA](https://openfga.dev/) - The authorization solution this dashboard is built for
- [shadcn/ui](https://ui.shadcn.com/) - UI component inspiration
- [Vercel](https://vercel.com/) - Hosting platform
