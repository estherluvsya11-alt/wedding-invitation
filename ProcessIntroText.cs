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
        string brainPath = @"C:\Users\esthe\.gemini\antigravity\brain\e4b31cbe-3624-4e8c-ad50-8325e75c5a78";
        
        string baseImagePath = Path.Combine(brainPath, "media__1776779778968.png");
        string textImagePath = Path.Combine(brainPath, "media__1776779781527.jpg");
        string outputImagePath = Path.Combine(workspacePath, "images", "intro_letter.jpg");

        Console.WriteLine("Loading base image...");
        using (Bitmap baseImage = new Bitmap(baseImagePath))
        {
            Console.WriteLine("Loading text image...");
            using (Bitmap origTextImage = new Bitmap(textImagePath))
            {
                // Crop the text image to remove desk background and margins
                int cropX = (int)(origTextImage.Width * 0.15f);
                int cropY = (int)(origTextImage.Height * 0.2f);
                int cropW = (int)(origTextImage.Width * 0.65f);
                int cropH = (int)(origTextImage.Height * 0.6f);
                
                Rectangle cropRect = new Rectangle(cropX, cropY, cropW, cropH);
                using (Bitmap textImage = origTextImage.Clone(cropRect, origTextImage.PixelFormat))
                {
                    using (Bitmap processedText = new Bitmap(textImage.Width, textImage.Height, PixelFormat.Format32bppArgb))
                    {
                        Console.WriteLine("Processing text image...");
                        for (int y = 0; y < textImage.Height; y++)
                        {
                            for (int x = 0; x < textImage.Width; x++)
                            {
                                Color c = textImage.GetPixel(x, y);
                                int luma = (int)(0.299 * c.R + 0.587 * c.G + 0.114 * c.B);
                                
                                int alpha = 0;
                                // Lower threshold again to perfectly eliminate corner shadows while keeping text solid
                                if (luma < 125) {
                                    alpha = (int)((125 - luma) * 7.0f);
                                    if (alpha > 255) alpha = 255;
                                    if (alpha < 0) alpha = 0;
                                }

                                // Darker ink color for clarity
                                processedText.SetPixel(x, y, Color.FromArgb(alpha, 30, 30, 30));
                            }
                        }

                        Console.WriteLine("Compositing...");
                        using (Graphics g = Graphics.FromImage(baseImage))
                        {
                            g.CompositingMode = CompositingMode.SourceOver;
                            g.CompositingQuality = CompositingQuality.HighQuality;
                            g.InterpolationMode = InterpolationMode.HighQualityBicubic;

                            // Make the extracted text larger relative to the background
                            float targetWidth = baseImage.Width * 0.75f;
                            float scale = targetWidth / textImage.Width;
                            int textW = (int)(textImage.Width * scale);
                            int textH = (int)(textImage.Height * scale);

                            int posX = (baseImage.Width - textW) / 2;
                            int posY = (int)(baseImage.Height * 0.12f); // Slightly higher

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
}
