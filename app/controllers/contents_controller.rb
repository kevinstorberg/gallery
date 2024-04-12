class ContentsController < ApplicationController
  before_action :set_content,       only: [:update, :destroy]
  before_action :authorize_content, only: [:update, :destroy]

  def create
    @content = Content.new(content_params)

    unless current_user.canvasses.where(id: @content.canvass_id).exists?
      return redirect_to canvasses_path
    end

    if @content.save
      render json: { success: true, content: @content.attributes }, status: 201
    else
      render json: { success: false }, status: 422
    end
  end

  def update
    @content.assign_attributes(content_params)

    if @content.save
      render json: { success: true, content: @content.attributes }, status: 204
    else
      render json: { success: false }, status: 422
    end
  end

  def destroy
    if @content.destroy
      render json: { success: true }, status: 204
    else
      render json: { success: false }, status: 422
    end
  end

  private

  def set_content
    @content = Content.find(params[:id])
  end

  def authorize_content
    unless current_user.contents.where(id: @content.id).exists?
      return redirect_to canvasses_path
    end
  end

  def content_params
    params.require(:content).permit(
      :canvass_id,
      styles: {})
  end
end