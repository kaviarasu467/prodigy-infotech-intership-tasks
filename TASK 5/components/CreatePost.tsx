
import React, { useState, useRef } from 'react';
import { Image, Video, X, Sparkles, Loader2 } from 'lucide-react';
import { enhancePostContent } from '../services/gemini';

interface CreatePostProps {
  onPost: (content: string, media?: string, mediaType?: 'image' | 'video', tags?: string[]) => void;
  currentUser: any;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPost, currentUser }) => {
  const [content, setContent] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setMediaType(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!content && !mediaPreview) return;
    setIsEnhancing(true);
    const result = await enhancePostContent(content, mediaType === 'image' ? mediaPreview! : undefined);
    if (result) {
      setContent(result.caption);
    }
    setIsEnhancing(false);
  };

  const handleSubmit = () => {
    if (!content.trim() && !mediaPreview) return;
    onPost(content, mediaPreview || undefined, mediaType);
    setContent('');
    setMediaPreview(null);
    setMediaType(undefined);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex gap-4">
        <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover shrink-0" />
        <div className="flex-1">
          <textarea 
            placeholder="What's vibing?" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-none focus:ring-0 text-lg placeholder:text-slate-400 min-h-[100px] resize-none"
          />
          
          {mediaPreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden bg-slate-100 max-h-80">
              <button 
                onClick={() => { setMediaPreview(null); setMediaType(undefined); }}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 z-10"
              >
                <X size={18} />
              </button>
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <video src={mediaPreview} controls className="w-full h-full object-contain" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Image size={20} />
                <span className="text-xs font-medium hidden sm:inline">Photo/Video</span>
              </button>
              <button 
                onClick={handleEnhance}
                disabled={isEnhancing || (!content && !mediaPreview)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isEnhancing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                <span className="text-xs font-medium hidden sm:inline">AI Enhance</span>
              </button>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!content.trim() && !mediaPreview}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
            >
              Post
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,video/*" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
