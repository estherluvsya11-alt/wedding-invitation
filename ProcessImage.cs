using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

class Program {
    static void Main(string[] args) {
        ProcessLetter("images/groom_letter_raw.jpg", "images/groom_letter_baked.jpg", 2.5f, 1.3f, true);
        ProcessLetter("images/bride_letter_new.jpg", "images/bride_letter_baked.jpg", 2.5f, 1.3f, false);
    }

    static void ProcessLetter(string inPath, string outPath, float contrast, float brightness, bool isGroom) {
        if (!File.Exists(inPath)) {
            Console.WriteLine("File not found: " + inPath);
            return;
        }
        
        using (Bitmap rawBmp = new Bitmap(inPath))
        {
            // Create a copy to allow drawing, just in case the raw format is locked
            using (Bitmap bmp = new Bitmap(rawBmp.Width, rawBmp.Height, PixelFormat.Format32bppArgb))
            {
                using (Graphics gSrc = Graphics.FromImage(bmp)) {
                    gSrc.DrawImage(rawBmp, 0, 0, rawBmp.Width, rawBmp.Height);
                    
                    if (isGroom) {
                        int w = bmp.Width;
                        int h = bmp.Height;
                        // Whitewash bottom left corner to erase shadows
                        gSrc.FillRectangle(Brushes.White, 0, (int)(0.72f * h), (int)(0.48f * w) + 1, h - (int)(0.72f * h) + 1);
                        // Whitewash bottom edge to erase shadows
                        gSrc.FillRectangle(Brushes.White, 0, (int)(0.86f * h), w, h - (int)(0.86f * h) + 1);
                    }
                }

                using (Bitmap resultBmp = new Bitmap(bmp.Width, bmp.Height))
                {
                    using (Graphics g = Graphics.FromImage(resultBmp))
                    {
                        // Create cream paper backdrop
                        g.Clear(Color.FromArgb(252, 252, 250));

                        // Draw blue lines
                        float ratio = bmp.Width / 280.0f;
                        float lineSpacing = 32.0f * ratio;
                        
                        using (Pen bluePen = new Pen(Color.FromArgb(50, 140, 170, 200), Math.Max(1.0f, ratio * 0.8f)))
                        {
                            for (float y = lineSpacing; y < bmp.Height; y += lineSpacing)
                            {
                                    g.DrawLine(bluePen, 0, y, bmp.Width, y);
                            }
                        }
                    }

                    MultiplyImage(bmp, resultBmp, contrast, brightness);
                    
                    ImageCodecInfo jpgEncoder = GetEncoder(ImageFormat.Jpeg);
                    Encoder myEncoder = Encoder.Quality;
                    EncoderParameters myEncoderParameters = new EncoderParameters(1);
                    myEncoderParameters.Param[0] = new EncoderParameter(myEncoder, 92L);

                    resultBmp.Save(outPath, jpgEncoder, myEncoderParameters);
                    Console.WriteLine("Baked " + outPath);
                }
            }
        }
    }

    static void MultiplyImage(Bitmap src, Bitmap dest, float contrast, float brightness) {
        Rectangle rect = new Rectangle(0, 0, src.Width, src.Height);
        BitmapData srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppPArgb);
        BitmapData destData = dest.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppPArgb);

        unsafe {
            byte* srcPtr = (byte*)srcData.Scan0;
            byte* destPtr = (byte*)destData.Scan0;
            int strideSrc = srcData.Stride;
            int strideDest = destData.Stride;

            for (int y = 0; y < src.Height; y++) {
                byte* sRow = srcPtr + (y * strideSrc);
                byte* dRow = destPtr + (y * strideDest);
                
                for (int x = 0; x < src.Width; x++) {
                    int idx = x * 4;
                    // b, g, r
                    float b = sRow[idx] / 255f;
                    float g = sRow[idx + 1] / 255f;
                    float r = sRow[idx + 2] / 255f;

                    // grayscale
                    float lum = 0.2126f * r + 0.7152f * g + 0.0722f * b;
                    
                    lum = lum * brightness;
                    lum = (lum - 0.5f) * contrast + 0.5f;

                    if (lum < 0) lum = 0;
                    if (lum > 1) lum = 1;

                    // multiply
                    float db = dRow[idx] / 255f;
                    float dg = dRow[idx + 1] / 255f;
                    float dr = dRow[idx + 2] / 255f;

                    dRow[idx] = (byte)(db * lum * 255);
                    dRow[idx + 1] = (byte)(dg * lum * 255);
                    dRow[idx + 2] = (byte)(dr * lum * 255);
                    dRow[idx + 3] = 255;
                }
            }
        }

        src.UnlockBits(srcData);
        dest.UnlockBits(destData);
    }

    private static ImageCodecInfo GetEncoder(ImageFormat format) {
        foreach (ImageCodecInfo codec in ImageCodecInfo.GetImageEncoders()) {
            if (codec.FormatID == format.Guid) {
                return codec;
            }
        }
        return null;
    }
}
