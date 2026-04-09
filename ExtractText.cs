using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        string workspacePath = @"C:\Users\esthe\.gemini\antigravity\scratch\wedding-invitation";
        string brainPath = @"C:\Users\esthe\.gemini\antigravity\brain\d3c71714-8001-4fdd-ad7e-ff8d0ebe7f5f";
        
        string textImagePath = Path.Combine(brainPath, "media__1775736167320.jpg");
        string outputImagePath = Path.Combine(workspacePath, "images", "handwriting_transparent.png");

        Console.WriteLine("Loading text image...");
        using (Bitmap textImage = new Bitmap(textImagePath))
        {
            // Create a transparent png
            using (Bitmap processedText = new Bitmap(textImage.Width, textImage.Height, PixelFormat.Format32bppArgb))
            {
                Console.WriteLine("Processing text image...");
                for (int y = 0; y < textImage.Height; y++)
                {
                    for (int x = 0; x < textImage.Width; x++)
                    {
                        Color c = textImage.GetPixel(x, y);
                        // Calculate Luma
                        int luma = (int)(0.299 * c.R + 0.587 * c.G + 0.114 * c.B);
                        
                        // We want the ink (dark) to have high alpha, and paper (light) to have 0 alpha.
                        int alpha = 255 - luma;
                        
                        // Enhance contrast. Paper is usually > 150, Ink < 100.
                        alpha = (int)((alpha - 60) * 1.8f);
                        if (alpha < 0) alpha = 0;
                        if (alpha > 255) alpha = 255;

                        // Give it an ink color (e.g. very dark gray/black #333333 or just use original color multiplied by alpha)
                        // Original color where it's dark is good. Let's just use dark gray.
                        int gray = 50;
                        processedText.SetPixel(x, y, Color.FromArgb(alpha, gray, gray, gray));
                    }
                }

                Console.WriteLine("Saving transparent text image...");
                processedText.Save(outputImagePath, ImageFormat.Png);
                Console.WriteLine("Result saved to " + outputImagePath);
            }
        }
    }
}
