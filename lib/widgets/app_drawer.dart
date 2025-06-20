import 'package:flutter/material.dart';
import 'package:provider/provider.dart' as provider;
import 'package:land_auction_app/services/auth_service.dart';
import 'package:land_auction_app/screens/my_bids_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:land_auction_app/theme/app_theme.dart';
import 'package:land_auction_app/widgets/app_logo.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = provider.Provider.of<AuthService>(context);
    final theme = Theme.of(context);
    final user = authService.currentUser;
    
    return Drawer(
      backgroundColor: theme.colorScheme.surface,
      elevation: 2,
      child: SafeArea(
        child: Column(
          children: [
            _buildHeader(context, user, theme),
            Divider(
              height: 1,
              thickness: 1,
              color: AppTheme.surfaceSecondaryColor,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(
                  children: [
                    _buildMenuItem(
                      context: context,
                      icon: Icons.home_outlined,
                      title: 'Anasayfa',
                      onTap: () {
                        Navigator.of(context).pushReplacementNamed('/');
                      },
                    ),
                    if (user != null) ...[
                      _buildMenuItem(
                        context: context,
                        icon: Icons.person_outline,
                        title: 'Profil',
                        onTap: () {
                          Navigator.of(context).pop();
                          Navigator.of(context).pushNamed('/profile');
                        },
                      ),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.history_outlined,
                        title: 'Teklifleriniz',
                        onTap: () {
                          Navigator.of(context).pop();
                          Navigator.of(context).pushNamed('/my-bids');
                        },
                      ),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.logout_outlined,
                        title: 'Çıkış Yap',
                        onTap: () async {
                          Navigator.of(context).pop();
                          await authService.signOut();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text('Çıkış yaptınız'),
                                behavior: SnackBarBehavior.floating,
                                backgroundColor: AppTheme.primaryColor,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            );
                          }
                        },
                      ),
                    ] else ...[
                      _buildMenuItem(
                        context: context,
                        icon: Icons.login_outlined,
                        title: 'Giriş Yap',
                        onTap: () {
                          Navigator.of(context).pop();
                          _showLoginDialog(context, authService);
                        },
                      ),
                    ],
                    _buildMenuItem(
                      context: context,
                      icon: Icons.info_outline,
                      title: 'Hakkında',
                      onTap: () {
                        Navigator.of(context).pop();
                        showAboutDialog(
                          context: context,
                          applicationName: 'Arazialcom',
                          applicationVersion: '1.0.0',
                          applicationIcon: Icon(
                            Icons.public,
                            color: AppTheme.primaryColor,
                            size: 32,
                          ),
                          applicationLegalese: '© 2023 Arazialcom',
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            Divider(
              height: 1,
              thickness: 1,
              color: AppTheme.surfaceSecondaryColor,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              child: Opacity(
                opacity: 0.7,
                child: Text(
                  'Arazialcom v1.0.0',
                  style: TextStyle(
                    color: AppTheme.textSecondaryColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildMenuItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    
    return ListTile(
      leading: Icon(
        icon,
        size: 20,
        color: AppTheme.textSecondaryColor,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppTheme.textColor,
        ),
      ),
      dense: true,
      visualDensity: VisualDensity.compact,
      horizontalTitleGap: 12,
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 0),
      onTap: onTap,
      hoverColor: AppTheme.surfaceSecondaryColor,
    );
  }
  
  Widget _buildHeader(BuildContext context, User? user, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const AppLogoHorizontal(size: 42),
            ],
          ),
          const SizedBox(height: 20),
          if (user != null) ...[
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                  child: Text(
                    user.email?[0].toUpperCase() ?? 'U',
                    style: TextStyle(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.email?.split('@').first ?? 'Kullanıcı',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textColor,
                        ),
                      ),
                      Text(
                        user.email ?? '',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondaryColor,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ] else ...[
            Text(
              'Hesabınız ile giriş yapın',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppTheme.textSecondaryColor,
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _showLoginDialog(context, provider.Provider.of<AuthService>(context, listen: false));
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                textStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              child: const Text('Giriş Yap'),
            ),
          ],
        ],
      ),
    );
  }
  
  void _showLoginDialog(BuildContext context, AuthService authService) {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final theme = Theme.of(context);
    
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(
          'Giriş Yap',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w500,
          ),
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: emailController,
                decoration: InputDecoration(
                  labelText: 'E-posta',
                  hintText: 'kullanici@ornek.com',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: passwordController,
                decoration: InputDecoration(
                  labelText: 'Şifre',
                  hintText: 'şifre',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                ),
                obscureText: true,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
            },
            child: Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final email = emailController.text.trim();
              final password = passwordController.text.trim();
              
              if (email.isEmpty || password.isEmpty) {
                return;
              }
              
              try {
                await authService.signIn(email: email, password: password);
                if (dialogContext.mounted) {
                  Navigator.of(dialogContext).pop();
                }
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Giriş başarısız: ${e.toString()}'),
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.colorScheme.primary,
              foregroundColor: theme.colorScheme.onPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Giriş Yap'),
          ),
        ],
      ),
    );
  }
}