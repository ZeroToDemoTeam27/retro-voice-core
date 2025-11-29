import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Trash2 } from 'lucide-react';

type KnowledgeBaseFile = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeBaseFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/markdown', 'text/plain'];
  const ALLOWED_EXTENSIONS = ['.pdf', '.pptx', '.md'];

  useEffect(() => {
    if (user) {
      loadProfile();
      loadKnowledgeFiles();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const loadKnowledgeFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setKnowledgeFiles(data || []);
    } catch (error: any) {
      console.error('Error loading knowledge files:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user?.id}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateUsername = async () => {
    try {
      setLoading(true);

      if (!username.trim()) {
        toast({
          title: 'Error',
          description: 'Username cannot be empty',
          variant: 'destructive',
        });
        return;
      }

      // Check if username is taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.trim())
        .neq('id', user?.id)
        .single();

      if (existingProfile) {
        toast({
          title: 'Error',
          description: 'Username already taken',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Username updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast({
        title: 'Error',
        description: 'Only PDF, PPTX, and MD files are allowed',
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleKnowledgeFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!validateFile(file)) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('knowledge-base')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('knowledge-base')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('knowledge_base')
          .insert({
            user_id: user?.id,
            file_name: file.name,
            file_url: publicUrl,
            file_type: fileExt || '',
            file_size: file.size,
          });

        if (dbError) throw dbError;
      }

      await loadKnowledgeFiles();
      toast({
        title: 'Success',
        description: 'Files uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    try {
      const filePath = fileUrl.split('/').slice(-2).join('/');
      
      const { error: storageError } = await supabase.storage
        .from('knowledge-base')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      await loadKnowledgeFiles();
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleKnowledgeFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="font-retro text-primary">Profile Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback className="font-retro text-2xl">
                {username.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button
                variant="outline"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </span>
              </Button>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </Label>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="font-retro text-primary">Email</Label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-retro text-primary">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleUpdateUsername}
            disabled={loading}
            className="w-full font-retro"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Knowledge Base Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-retro text-primary">Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supported formats: PDF, PPTX, MD (max 10MB)
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.md"
              multiple
              className="hidden"
              onChange={(e) => handleKnowledgeFileUpload(e.target.files)}
              disabled={uploading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Select Files'}
            </Button>
          </div>

          {/* File List */}
          {knowledgeFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Uploaded Files</h3>
              <div className="space-y-2">
                {knowledgeFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFile(file.id, file.file_url)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Profile;