// Я AIᵐ — native shell stub. v0 runs from /web.
import 'package:flutter/material.dart';

void main() => runApp(const YaApp());

class YaApp extends StatelessWidget {
  const YaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Я AIᵐ',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(scaffoldBackgroundColor: const Color(0xFF0B0B0C)),
      home: const Scaffold(
        body: Center(
          child: Text('Я', style: TextStyle(fontSize: 96, fontFamily: 'Georgia')),
        ),
      ),
    );
  }
}
