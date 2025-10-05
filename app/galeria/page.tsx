import { GalleryHeader } from "@/components/gallery-header"
import { GalleryGrid } from "@/components/gallery-grid"
import { GallerySidebar } from "@/components/gallery-sidebar"

export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <GalleryHeader />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3">
            <GalleryGrid />
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <GallerySidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
