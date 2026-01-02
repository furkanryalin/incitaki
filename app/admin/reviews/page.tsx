'use client';

import { useAdmin } from '@/context/AdminContext';
import { MessageSquare, Check, X, Reply, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function ReviewsPage() {
  const { reviews, updateReview, deleteReview, replyToReview } = useAdmin();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  
  const filteredReviews = reviews.filter(review => {
    if (filter === 'approved') return review.approved;
    if (filter === 'pending') return !review.approved;
    return true;
  });

  const handleApprove = async (reviewId: string) => {
    setProcessing(reviewId);
    try {
      await updateReview(reviewId, { approved: true });
    } catch (error) {
      console.error('Error approving review:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (confirm('Bu yorumu reddetmek istediğinizden emin misiniz? Yorum silinecektir.')) {
      setProcessing(reviewId);
      try {
        await deleteReview(reviewId);
      } catch (error) {
        console.error('Error rejecting review:', error);
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleReply = async (reviewId: string) => {
    if (replyText.trim()) {
      setProcessing(reviewId);
      try {
        await replyToReview(reviewId, replyText);
        setReplyingTo(null);
        setReplyText('');
      } catch (error) {
        console.error('Error replying to review:', error);
      } finally {
        setProcessing(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Yorumlar</h1>
        <p className="text-gray-600 mt-2">Ürün yorumlarını görüntüleyin ve yönetin</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Tümü ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Beklemede ({reviews.filter(r => !r.approved).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Onaylandı ({reviews.filter(r => r.approved).length})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {reviews.length === 0 
                  ? 'Henüz yorum bulunmuyor'
                  : `Bu filtreye uygun yorum bulunmuyor`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className={`border rounded-lg p-6 ${
                    review.approved 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-yellow-200 bg-yellow-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.userName}</h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {review.approved ? (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                            Onaylandı
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                            Beklemede
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Ürün:</span> {review.productName}
                      </p>
                      {review.userEmail && (
                        <p className="text-xs text-gray-400 mb-2">{review.userEmail}</p>
                      )}
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!review.approved && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={processing === review.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Onayla"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {review.approved && (
                        <button
                          onClick={() => handleReject(review.id)}
                          disabled={processing === review.id}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reddet"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
                            deleteReview(review.id);
                          }
                        }}
                        disabled={processing === review.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sil"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {review.reply ? (
                    <div className="mt-4 pl-4 border-l-4 border-orange-500 bg-orange-50 p-3 rounded">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Yanıt:</p>
                      <p className="text-gray-700">{review.reply}</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      {replyingTo === review.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Yanıtınızı yazın..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(review.id)}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                              Yanıtla
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(review.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        >
                          <Reply className="w-4 h-4" />
                          Yanıtla
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

