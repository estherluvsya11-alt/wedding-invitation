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
        
        string baseImagePath = Path.Combine(brainPath, "media__1775736085964.jpg");
        string textImagePath = Path.Combine(brainPath, "media__1775736167320.jpg");
        string outputImagePath = Path.Combine(workspacePath, "images", "cover_with_text.jpg");

        Console.WriteLine("Loading base image...");
        using (Bitmap baseImage = new Bitmap(baseImagePath))
        {
            Console.WriteLine("Loading text image...");
            using (Bitmap textImage = new Bitmap(textImagePath))
            {
                // Create a temporary bitmap to hold the processed transparent white text
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
                            
                            // Invert for alpha: dark ink -> high alpha, white paper -> 0 alpha
                            int alpha = 255 - luma;
                            
                            // Increase contrast to hide paper completely and make ink solid
                            // Paper usually has luma > 180, ink < 100
                            alpha = (int)((alpha - 60) * 1.8f);
                            
                            if (alpha < 0) alpha = 0;
                            if (alpha > 255) alpha = 255;

                            processedText.SetPixel(x, y, Color.FromArgb(alpha, 255, 255, 255));
                        }
                    }

                    Console.WriteLine("Compositing...");
                    // We want to overlay this on the top right.
                    using (Graphics g = Graphics.FromImage(baseImage))
                    {
                        g.CompositingMode = CompositingMode.SourceOver;
                        g.CompositingQuality = CompositingQuality.HighQuality;
                        g.InterpolationMode = InterpolationMode.HighQualityBicubic;

                        // Calculate scale to fit nicely in the top right. 
                        // The base image is vertically oriented (e.g. 800x1200)
                        // Hand writing image needs to be scaled down.
                        float targetWidth = baseImage.Width * 0.7f; // take 70% width
                        float scale = targetWidth / textImage.Width;
                        int textW = (int)(textImage.Width * scale);
                        int textH = (int)(textImage.Height * scale);

                        // Position at top right
                        int posX = baseImage.Width - textW - 20; // 20px padding from right
                        int posY = 50; // 50px padding from top

                        g.DrawImage(processedText, new Rectangle(posX, posY, textW, textH));
                    }

                    Console.WriteLine("Saving result...");
                    baseImage.Save(outputImagePath, ImageFormat.Jpeg);
                    Console.WriteLine("Result saved to " + outputImagePath);
                }
            }
        }
    }
}
